export interface Value {
    id: number
    commentListNumber: number
    isNa: number
    number: number
    text: string
    type: number
    userText: string
}

export interface Option {
    id: number
    name: string
    number: number
    isComplete: number
    values: Value[]
}

export interface Section {
    id: number
    name: string
    sectionIndex: number
    tag: string
    isComplete: number
    subsections: SubSection[]
}

export interface SubSection {
    id: number
    name: string
    number: number
    subsectionIndex: number
    isComplete: number
    options: Option[]
}
