export function createEl<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: {
      className?: string,
      attributes?: { [key: string]: string },
      text?: string
    }
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (options) {
      if (options.className) el.className = options.className;
      if (options.text) el.textContent = options.text;
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([attr, value]) => {
          el.setAttribute(attr, value);
        });
      }
    }
    return el;
  }