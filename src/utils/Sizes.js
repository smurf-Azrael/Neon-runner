class Sizes {
    static instance;

    constructor(DOMElement) {
        if (Sizes.instance) return Sizes.instance;
        
        if (!DOMElement) {
            console.warn('No domelement specified!');
            return;
        }

        Sizes.instance = this;

        this.dom_element = DOMElement;
        this.width = this.dom_element.offsetWidth;
        this.height = this.dom_element.offsetHeight;
    }

    Resize() {
        this.width = this.dom_element.offsetWidth;
        this.height = this.dom_element.offsetHeight;
    }
}

export default Sizes;