import { ActionCreator, createAction, props } from '@ngrx/store';
import { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import {PageRequestDto} from "../models/pagination.model";
import {PageDto} from "../models/page.model";

export class AbstractActions<T> {
  public getAll: ActionCreator<string, (props: ({ request: PageRequestDto } & NotAllowedCheck<{ request: PageRequestDto }>)) => ({ request: PageRequestDto } & TypedAction<string>)>;
   public getAllSuccess: ActionCreator<string, (props: ({ result: PageDto<T> } & NotAllowedCheck<{ result: PageDto<T> }>)) => ({ result: PageDto<T> } & TypedAction<string>)>;
  public getAllFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  public getOne: ActionCreator<string, (props: ({ uuid: string } & NotAllowedCheck<{ uuid: string }>)) => ({ uuid: string } & TypedAction<string>)>;
  public getOneSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public getOneFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  public create: ActionCreator<string, (props: ({ payload: T } & NotAllowedCheck<{ payload: T }>)) => ({ payload: T } & TypedAction<string>)>;
  public createSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public createFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  public update: ActionCreator<string, (props: ({ payload: T } & NotAllowedCheck<{ payload: T }>)) => ({ payload: T } & TypedAction<string>)>;
  public updateSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public updateFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  public delete: ActionCreator<string, (props: ({ uuid: string } & NotAllowedCheck<{ uuid: string }>)) => ({ uuid: string } & TypedAction<string>)>;
  public deleteSuccess: ActionCreator<string, (props: ({ result: boolean } & NotAllowedCheck<{ result: boolean }>)) => ({ result: boolean } & TypedAction<string>)>;
  public deleteFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  constructor(type: string) {
    this.getAll = createAction(`[${type}] Get All`, props<{request: PageRequestDto}>());
    this.getAllSuccess = createAction(`[${type}] Get All Success`, props<{result: PageDto<T>}>());
    this.getAllFailure = createAction(`[${type}] Get All Failure`, props<{error: any}>());

    this.getOne = createAction(`${type}] Get One`, props<{uuid: string}>());
    this.getOneSuccess = createAction(`[${type}] Get One Success`, props<{result: T}>());
    this.getOneFailure = createAction(`[${type}] Get One Failure`, props<{error: any}>());

    this.create = createAction(`[${type}] Create`, props<{payload: T}>());
    this.createSuccess = createAction(`[${type}] Create Success`, props<{result: T}>());
    this.createFailure = createAction(`[${type}] Create Failure`, props<{error: any}>());

    this.update = createAction(`[${type}] Update`, props<{payload: T}>());
    this.updateSuccess = createAction(`[${type}] Update Success`, props<{result: T}>());
    this.updateFailure = createAction(`[${type}] Update Failure`, props<{error: any}>());

    this.delete = createAction(`[${type}] Delete`, props<{uuid: string}>());
    this.deleteSuccess = createAction(`[${type}] Delete Success`, props<{result: boolean}>());
    this.deleteFailure = createAction(`[${type}] Delete Failure`, props<{error: any}>());
  }
}
