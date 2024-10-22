interface Curriculum {
  title: string;
  description: string;
  chapterList: Chapter[];
  comment: string;
}
interface Chapter {
  id: number;
  title: string;
  goal: string;
  description: string;
  content:string;
  createDate: Date;
  completeDate: Date;
}
interface Chat {
  [x: string]: any;
  isUser: boolean, 
  content: String,
  createDate?: Date
}
interface Chap {
  id:number
  title:string
  createDate:Date
  chatList:[Chat]
}