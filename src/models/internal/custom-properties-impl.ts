import { PrivateCustomProperties } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';

/** Custom properties implementation from official NodeJS SDK for App Insights */
export class CustomPropertiesImpl implements PrivateCustomProperties {
  private static readonly bannedCharacters = /[,=]/;
  private props: { key: string; value: string }[] = [];

  public constructor(header: string) {
    this.addHeaderData(header);
  }

  /**
   * Convert a correlation context header into a properties map and combine with this
   *
   * @param header the header text
   */
  public addHeaderData(header?: string): void {
    const keyvals = header ? header.split(', ') : [];
    this.props = keyvals.map(keyval => {
      const parts = keyval.split('=');
      return { key: parts[0], value: parts[1] };
    }).concat(this.props);
  }

  /**
   * Serialise the custom correlation context properties into a single header string
   */
  public serializeToHeader(): string {
    return this.props.map(keyval => {
      return `${keyval.key}=${keyval.value}`;
    }).join(', ');
  }

  /**
   * Get a correlation context property
   *
   * @param prop property name
   */
  public getProperty(prop: string): string {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.props.length; ++i) {
      const keyval = this.props[i];
      if (keyval.key === prop) {
        return keyval.value;
      }
    }

    return '';
  }

  /**
   * Set a correlation context property
   *
   * TODO: Strictly according to the spec, properties which are recieved from
   * an incoming request should be left untouched, while we may add our own new
   * properties. The logic here will need to change to track that.
   *
   * @param prop
   * @param val
   */
  public setProperty(prop: string, val: string): void {
    if (CustomPropertiesImpl.bannedCharacters.test(prop) || CustomPropertiesImpl.bannedCharacters.test(val)) {
      // Logging.warn(`Correlation context property keys and values must not contain ',' or '='.
      // setProperty was called with key: ${prop} and value: ${val}`);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.props.length; ++i) {
      const keyval = this.props[i];
      if (keyval.key === prop) {
        keyval.value = val;
        return;
      }
    }
    this.props.push({ key: prop, value: val });
  }
}
