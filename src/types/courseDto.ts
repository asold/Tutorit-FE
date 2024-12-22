// CourseDto.ts
export interface CourseDto {
    id: string;
    name: string;
    description: string;
    rating: number;
    language: string;
    tutor: {
        id: string;
        fullName: string;
    };
    labels: Label[];
    image:string;
}

export interface Label {
    id: string;
    name: string;
}


