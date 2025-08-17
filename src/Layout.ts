class Layout{
    config: LayoutItem[]
    container: HTMLElement
    columns: Column[] = []
    constructor(container: HTMLElement,opts: LayoutItem[]){
        this.config = opts
        this.container = container
        this.parseConfig()
        this.setupContainer()
        this.makeColumns()
    }
    parseConfig(){
        const me = this
        this.config.forEach(c => {
            if(c.type == "Column"){
                let column = new Column(c.width, c.onRender)
                let sections = c.sections
                if(sections.length > 1){
                    sections.forEach((s) => {
                        column.sections.push(new Section(s))
                    })
                }
                me.columns.push(column)
            }
        })
    }
    setupContainer(){
        this.container.style.display = "flex";
        this.container.style.flexDirection = "row";
        this.container.classList.add("blocks");
    }
    makeColumns(){
        const me = this
        this.columns.forEach((c) =>{
            c.wrapper = me.container.createDiv();
            c.wrapper.classList.add("rect_border");
            c.wrapper.style.flex = c.width.toString()
            c.setupColumn()
        })
    }
}

class Column{
    width: number
    wrapper: HTMLElement
    onRender: Function | undefined
    sections: Section[]
    constructor(width: number, onRender?: Function){
        this.width = width
        this.sections = []
        this.onRender = onRender
    }
    setupColumn(){
        const me = this
        this.wrapper.style.display = "flex";
        this.wrapper.classList.add("blocks");
        this.wrapper.style.flexDirection = "column";
        if(this.onRender){
            this.onRender(this.wrapper)
        }
        this.sections.forEach(s => {
            s.wrapper = this.wrapper.createDiv();
            s.setupSection()
        })
    }

}

class Section {
    wrapper: HTMLElement
    height: number | string;
    flex_height: string;
    width: number;
    onRender : Function
    classNames: string
    constructor(opts: SectionConfig){
        Object.assign(this, opts)
    }
    setupSection(){
        const me = this;
        if(this.height){
            this.wrapper.style.height = this.height.toString()
        }else if(this.flex_height){
            this.wrapper.style.flex = this.flex_height
        }
        if(this.onRender){
            this.onRender(this.wrapper)
        }
        if(this.classNames){
            this.wrapper.addClasses(this.classNames.split(" "))      
        }
    }
}

interface LayoutItem {
  type: string;
  width: number;
  onRender?: Function,
  sections: SectionConfig[];
}

interface SectionConfig {
  height?: number | string;
  flex_height?: string;
  classNames: string;
  onRender?: (wrapper: HTMLElement) => void;
}
export default Layout;