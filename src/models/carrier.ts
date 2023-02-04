class Carrier {
  readonly name: string;
  readonly color: string;

  public constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }

  public toString() {
    return `${this.name} (${this.color})`;
  }
}

export { Carrier };
