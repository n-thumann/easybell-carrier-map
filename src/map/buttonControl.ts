import { IControl } from "maplibre-gl";

interface Button {
  title: string;
  class: string;
  callback: () => void;
}

class ButtonControl implements IControl {
  private container: HTMLElement;

  constructor(buttons: Button[]) {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    for (const button of buttons) {
      const buttonElement = document.createElement("button");
      buttonElement.className = button.class;
      buttonElement.title = button.title;
      buttonElement.addEventListener("click", button.callback);

      this.container.appendChild(buttonElement);
    }
  }

  public onAdd() {
    return this.container;
  }

  public onRemove() {
    this.container.parentNode?.removeChild(this.container);
  }
}

export { ButtonControl };
