import { HttpParams } from '@angular/common/http';
import { keys } from 'lodash';

export const toParams = (obj: any): HttpParams => {
  const params = new HttpParams();

  keys(obj).forEach(key => {
    if (obj[key]) {
      params.append(key, obj[key]);
    }
  });

  return params;
}
