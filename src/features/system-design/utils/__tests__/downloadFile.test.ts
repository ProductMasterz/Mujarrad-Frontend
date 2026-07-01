import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { downloadDataUrlFile, downloadFile, downloadFiles, downloadTextFile } from '../downloadFile';

describe('downloadFile utilities', () => {
  let clickSpy: jest.SpiedFunction<() => void>;
  let appendSpy: jest.SpiedFunction<typeof document.body.appendChild>;
  let removeSpy: jest.SpiedFunction<typeof document.body.removeChild>;
  let createObjectURLSpy: jest.Mock;
  let revokeObjectURLSpy: jest.Mock;

  beforeEach(() => {
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    appendSpy = jest.spyOn(document.body, 'appendChild');
    removeSpy = jest.spyOn(document.body, 'removeChild');

    createObjectURLSpy = jest.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = jest.fn();

    // jsdom does not implement these by default.
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLSpy,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLSpy,
      configurable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('downloadTextFile creates a Blob, an anchor with the right download name, and clicks it', () => {
    downloadTextFile('spec.md', '# Hello', 'text/markdown');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('spec.md');
    expect(anchor.href).toContain('blob:mock-url');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('downloadTextFile revokes the object URL after a delay', () => {
    downloadTextFile('spec.md', '# Hello');

    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('downloadDataUrlFile sets the anchor href directly to the data URL without creating a Blob', () => {
    downloadDataUrlFile('diagram.png', 'data:image/png;base64,AAAA');

    expect(createObjectURLSpy).not.toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('diagram.png');
    expect(anchor.href).toBe('data:image/png;base64,AAAA');
  });

  it('downloadFile dispatches utf-8 encoded files through downloadTextFile', () => {
    downloadFile({ fileName: 'spec.md', content: '# Hello', encoding: 'utf-8' });

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it('downloadFile dispatches data-url encoded files directly', () => {
    downloadFile({
      fileName: 'diagram.png',
      content: 'data:image/png;base64,AAAA',
      encoding: 'data-url',
    });

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.href).toBe('data:image/png;base64,AAAA');
  });

  it('downloadFile builds a data URL for base64 encoded files using the mime type', () => {
    downloadFile({
      fileName: 'diagram.png',
      content: 'AAAA',
      encoding: 'base64',
      mimeType: 'image/png',
    });

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.href).toBe('data:image/png;base64,AAAA');
  });

  it('downloadFile defaults to utf-8 encoding when none is provided', () => {
    downloadFile({ fileName: 'notes.txt', content: 'hello' });
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it('downloadFiles triggers a download for every file in the list', () => {
    downloadFiles([
      { fileName: 'a.md', content: 'a', encoding: 'utf-8' },
      { fileName: 'b.xml', content: 'b', encoding: 'utf-8' },
    ]);

    expect(appendSpy).toHaveBeenCalledTimes(2);
  });
});
