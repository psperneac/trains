import {Injectable} from "@angular/core";
import {AbstractService} from "../../../helpers/abstract.service";
import {PlaceTypeDto} from "../../../models/place-type.model";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PlaceTypeService extends AbstractService<PlaceTypeDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/place-types');
  }
}
