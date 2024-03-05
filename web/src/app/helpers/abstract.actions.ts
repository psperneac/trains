import { ActionCreator, createAction, props } from '@ngrx/store';
import { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import {PageRequestDto} from "../models/pagination.model";
import {PageDto} from "../models/page.model";

export type IsActionChecker = (action: TypedAction<string>) => boolean;
export type ActionCreatorFn<T extends object> = (props: T & NotAllowedCheck<T>) => (T & TypedAction<string>);

export class AbstractActions<T> {
  public getAll: ActionCreator<string, (props: ({ request: PageRequestDto } & NotAllowedCheck<{ request: PageRequestDto }>)) => ({ request: PageRequestDto } & TypedAction<string>)>;
  public isGetAll: IsActionChecker;
  public getAllSuccess: ActionCreator<string, (props: ({ result: PageDto<T> } & NotAllowedCheck<{ result: PageDto<T> }>)) => ({ result: PageDto<T> } & TypedAction<string>)>;
  public isGetAllSuccess: IsActionChecker;
  public getAllFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;
  public isGetAllFailure: IsActionChecker;

  public getOne: ActionCreator<string, (props: ({ uuid: string } & NotAllowedCheck<{ uuid: string }>)) => ({ uuid: string } & TypedAction<string>)>;
  public isGetOne: IsActionChecker;
  public getOneSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public isGetOneSuccess: IsActionChecker;
  public getOneFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;
  public isGetOneFailure: IsActionChecker;

  public create: ActionCreator<string, (props: ({ payload: T } & NotAllowedCheck<{ payload: T }>)) => ({ payload: T } & TypedAction<string>)>;
  public isCreate: IsActionChecker;
  public createSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public isCreateSuccess: IsActionChecker;
  public createFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;
  public isCreateFailure: IsActionChecker;

  public update: ActionCreator<string, (props: ({ payload: T } & NotAllowedCheck<{ payload: T }>)) => ({ payload: T } & TypedAction<string>)>;
  public isUpdate: IsActionChecker;
  public updateSuccess: ActionCreator<string, (props: ({ result: T } & NotAllowedCheck<{ result: T }>)) => ({ result: T } & TypedAction<string>)>;
  public isUpdateSuccess: IsActionChecker;
  public updateFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;
  public isUpdateFailure: IsActionChecker;

  public delete: ActionCreator<string, (props: ({ uuid: string } & NotAllowedCheck<{ uuid: string }>)) => ({ uuid: string } & TypedAction<string>)>;
  public isDelete: IsActionChecker;
  public deleteSuccess: ActionCreator<string, (props: ({ result: string } & NotAllowedCheck<{ result: string }>)) => ({ result: string } & TypedAction<string>)>;
  public isDeleteSuccess: IsActionChecker;
  public deleteFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;
  public isDeleteFailure: IsActionChecker;

  public selectOne: ActionCreator<`[${string}] Select One`, (props: ({ payload: T } & NotAllowedCheck<{ payload: T }>)) => ({ payload: T } & TypedAction<`[${string}] Select One`>)>;
  public isSelectOne: IsActionChecker;

  constructor(type: string) {
    this.getAll = createAction(`[${type}] Get All`, props<{request: PageRequestDto}>());
    this.isGetAll = (action: TypedAction<string>) => action.type === `[${type}] Get All`;

    this.getAllSuccess = createAction(`[${type}] Get All Success`, props<{result: PageDto<T>}>());
    this.isGetAllSuccess = (action: TypedAction<string>) => action.type === `[${type}] Get All Success`;
    this.getAllFailure = createAction(`[${type}] Get All Failure`, props<{error: any}>());
    this.isGetAllFailure = (action: TypedAction<string>) => action.type === `[${type}] Get All Failure`;

    this.getOne = createAction(`${type}] Get One`, props<{uuid: string}>());
    this.isGetOne = (action: TypedAction<string>) => action.type === `[${type}] Get One`;
    this.getOneSuccess = createAction(`[${type}] Get One Success`, props<{result: T}>());
    this.isGetOneSuccess = (action: TypedAction<string>) => action.type === `[${type}] Get One Success`;
    this.getOneFailure = createAction(`[${type}] Get One Failure`, props<{error: any}>());
    this.isGetOneFailure = (action: TypedAction<string>) => action.type === `[${type}] Get One Failure`;

    this.create = createAction(`[${type}] Create`, props<{payload: T}>());
    this.isCreate = (action: TypedAction<string>) => action.type === `[${type}] Create`;
    this.createSuccess = createAction(`[${type}] Create Success`, props<{result: T}>());
    this.isCreateSuccess = (action: TypedAction<string>) => action.type === `[${type}] Create Success`;
    this.createFailure = createAction(`[${type}] Create Failure`, props<{error: any}>());
    this.isCreateFailure = (action: TypedAction<string>) => action.type === `[${type}] Create Failure`;

    this.update = createAction(`[${type}] Update`, props<{payload: T}>());
    this.isUpdate = (action: TypedAction<string>) => action.type === `[${type}] Update`;
    this.updateSuccess = createAction(`[${type}] Update Success`, props<{result: T}>());
    this.isUpdateSuccess = (action: TypedAction<string>) => action.type === `[${type}] Update Success`;
    this.updateFailure = createAction(`[${type}] Update Failure`, props<{error: any}>());
    this.isUpdateFailure = (action: TypedAction<string>) => action.type === `[${type}] Update Failure`;

    this.delete = createAction(`[${type}] Delete`, props<{uuid: string}>());
    this.isDelete = (action: TypedAction<string>) => action.type === `[${type}] Delete`;
    this.deleteSuccess = createAction(`[${type}] Delete Success`, props<{result: string}>());
    this.isDeleteSuccess = (action: TypedAction<string>) => action.type === `[${type}] Delete Success`;
    this.deleteFailure = createAction(`[${type}] Delete Failure`, props<{error: any}>());
    this.isDeleteFailure = (action: TypedAction<string>) => action.type === `[${type}] Delete Failure`;

    this.selectOne = createAction(`[${type}] Select One`, props<{payload: T}>());
    this.isSelectOne = (action: TypedAction<string>) => action.type === `[${type}] Select One`;
  }
}
