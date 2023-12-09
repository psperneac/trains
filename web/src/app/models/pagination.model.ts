export class PageRequestDto {
  unpaged?: boolean;
  page?: number;
  limit?: number;
  sortColumn? = '';
  sortDescending? = false;
  filter? = '';
}
