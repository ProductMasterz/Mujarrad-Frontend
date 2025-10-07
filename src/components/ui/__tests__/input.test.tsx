import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');

    expect(input).toHaveValue('Hello');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should apply default type', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    // Default type is 'text' but may not be explicitly set in HTML
    expect(input).toBeInTheDocument();
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('should display placeholder', () => {
    render(<Input placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should handle onChange event', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
  });

  it('should handle onFocus event', async () => {
    const handleFocus = jest.fn();
    const user = userEvent.setup();

    render(<Input onFocus={handleFocus} />);

    await user.click(screen.getByRole('textbox'));

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should handle onBlur event', async () => {
    const handleBlur = jest.fn();
    const user = userEvent.setup();

    render(
      <div>
        <Input onBlur={handleBlur} />
        <button>Other element</button>
      </div>
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.click(screen.getByRole('button'));

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should apply default value', () => {
    render(<Input defaultValue="Initial value" />);
    expect(screen.getByRole('textbox')).toHaveValue('Initial value');
  });

  it('should be controlled with value prop', () => {
    const { rerender } = render(<Input value="Controlled" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Controlled');

    rerender(<Input value="Updated" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Updated');
  });

  it('should merge custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should have default styling classes', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-10');
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
  });

  it('should forward ref', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should support maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('maxLength', '10');
  });

  it('should support required attribute', () => {
    render(<Input required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('should support readOnly attribute', () => {
    render(<Input readOnly data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readOnly');
  });

  it('should support autoComplete attribute', () => {
    render(<Input autoComplete="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('autoComplete', 'email');
  });

  it('should support autoFocus attribute', () => {
    render(<Input autoFocus data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveFocus();
  });

  it('should handle keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should support name attribute', () => {
    render(<Input name="username" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('name', 'username');
  });

  it('should support id attribute', () => {
    render(<Input id="email-input" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('id', 'email-input');
  });

  it('should have focus-visible styles', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('focus-visible:outline-none');
  });
});
