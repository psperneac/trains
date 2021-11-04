export class PageRequestDto {
  page: number;
  limit: number;
  sortColumn = '';
  sortDescending = false;
  filter = '';
}
