

This plan is updated for the current date of **Saturday, October 4, 2025**.

-----

### Part 1: The Core Toolchain (Gradle Edition)

The set of tools remains largely the same, with the key change being the build tool.

1.  **CI/CD Orchestrator:** **GitHub Actions**
2.  **Build Tool:** **Gradle** - We will use the Gradle Wrapper (`./gradlew`) to ensure consistent, reproducible builds across all environments (local developer machines and the CI/CD runner).
3.  **Containerization:** **Docker**
4.  **Code Quality & SAST:** **SonarQube**
5.  **Dependency Scanning:** **Snyk** or **GitHub Dependabot**
6.  **Testing:** **JUnit 5, Mockito, and Testcontainers**
7.  **Code Obfuscation:** **ProGuard** (via the `gradle-proguard-plugin`)

-----

### Part 2: The Branching and Pipeline Workflow

This high-level flow remains unchanged and is perfectly suited for your development process.

**Branch Strategy:**
`feature/*` -\> `development` -\> `staging` -\> `production`

**Pipeline Triggers:**

  * **On PR to `development`:** Quick check (Compile + Unit Tests).
  * **On PR to `staging`:** **Full CI Quality Gauntlet** (Test, Analyze, Scan, Build candidate).
  * **On Merge to `staging`:** Deploy the candidate build to the Render staging environment.
  * **On Merge to `production`:** Trigger Render to build and deploy the final artifact to production.

-----

### Part 3: Detailed Pipeline Stages (Gradle Implementation)

Here is the updated step-by-step breakdown for your `github-actions.yml` file, now using Gradle commands.

#### **Trigger: On Pull Request to `staging`**

```yaml
name: Staging CI and Quality Gate (Gradle)
on:
  pull_request:
    branches: [ staging ]
```

**Job 1: `test_and_analyze`**
This job validates the quality and security of your codebase.

1.  **Checkout Code:**

      * `actions/checkout@v4`

2.  **Set up Java (JDK):**

      * `actions/setup-java@v4` (e.g., with JDK 17 or 21)

3.  **Cache Gradle Dependencies:**

      * `actions/cache@v4`
      * **Purpose:** This is crucial for performance. It caches the Gradle Wrapper and downloaded dependencies.
      * **Configuration:**
        ```yaml
        - name: Cache Gradle packages
          uses: actions/cache@v4
          with:
            path: |
              ~/.gradle/caches
              ~/.gradle/wrapper
            key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
        ```

4.  **Make Gradle Wrapper Executable:**

      * **Command:** `chmod +x ./gradlew`
      * **Purpose:** Ensures the script has the necessary permissions to run in the CI environment.

5.  **Run Tests:**

      * **Command:** **`./gradlew build`**
      * **Purpose:** The standard `build` task in Gradle compiles the code, runs all tests (both unit and integration), and assembles the JAR. This single command is often sufficient. The pipeline will fail here if any test fails.

6.  **Scan for Dependency Vulnerabilities:**

      * **Tool:** Snyk CLI Action
      * **Command:** **`snyk test --all-projects`** (after setting up the Snyk action).
      * **Purpose:** Scans Gradle dependencies from your `build.gradle` file.

7.  **Analyze with SonarQube:**

      * **Depends on:** Successful test completion.
      * **Configuration:** You'll need to apply and configure the `org.sonarqube` plugin in your `build.gradle` file.
      * **Command:** **`./gradlew sonarqube`**
      * **Purpose:** This task compiles the code, runs tests to generate coverage reports (via the JaCoCo plugin), and sends the comprehensive analysis to your SonarQube server.
      * **Quality Gate:** The pipeline will poll SonarQube and fail if the Quality Gate is not passed.

#### **Job 2: `build_obfuscate_and_package` (Runs only if `test_and_analyze` succeeds)**

This job creates the final, production-ready Docker image.

1.  **Checkout Code, Set up Java, Restore Cache, Make Gradle Executable:** (Same as above).

2.  **Obfuscate and Build the JAR:**

      * **Configuration:** You will use a plugin like `com.github.wvengen.proguard` in your `build.gradle`. You configure it to run the `proguard` task as part of the main `build` process. You can tie its execution to a Gradle project property (e.g., `-Pobfuscate=true`) to control when it runs.
      * **Command:** **`./gradlew build -Pobfuscate=true -x test`**
      * **Explanation:**
          * `build`: Assembles the final JAR.
          * `-Pobfuscate=true`: A project property to activate the obfuscation task.
          * `-x test`: Skips running the tests again, as they were already validated in the previous job.
      * **Output:** An obfuscated `.jar` file in the `build/libs/` directory.

3.  **Build and Push Docker Image:**

      * **Tool:** `docker/build-push-action@v5`

      * **Dockerfile (Updated for Gradle):** The paths for Gradle's output are different from Maven's.

        ```dockerfile
        # Stage 1: Use a full JDK to build the obfuscated JAR with Gradle
        FROM openjdk:17-jdk-slim as builder
        WORKDIR /app
        COPY . .
        # Grant executable permissions and build
        RUN chmod +x ./gradlew && ./gradlew build -Pobfuscate=true -x test

        # Stage 2: Use a smaller JRE for the final image
        FROM openjdk:17-jre-slim
        WORKDIR /app
        # Copy only the obfuscated JAR from the builder stage
        # NOTE: The JAR name might vary, adjust if needed
        COPY --from=builder /app/build/libs/*.jar app.jar
        EXPOSE 8080
        ENTRYPOINT ["java", "-jar", "app.jar"]
        ```

-----

### Part 4: Render.com Integration

The integration with Render remains unchanged. Render's build process will be triggered by your merge to the `production` branch. It will check out the code, and because your `Dockerfile` contains the entire build logic (`RUN ./gradlew build...`), Render will independently build the exact same obfuscated JAR and container image, ensuring a consistent deployment from a trusted source branch.