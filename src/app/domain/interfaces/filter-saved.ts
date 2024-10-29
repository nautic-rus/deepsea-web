export interface IFilterSaved {
  id: number,
  name: string,
  page: 'home' | 'doclist',  //home | doclist
  showCompleted: number
  user_id: number,
  value: string,
}
