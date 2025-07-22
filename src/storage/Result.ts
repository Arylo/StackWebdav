import lodash from 'lodash'
import { match } from "ts-pattern"
import Status from 'http-status'

export enum RESULT_STATUS {
  OK = 'Okay',
  CREATED = 'Created',
  EXISTS = 'Exists',
  NOT_STORAGE = 'Not Storage',
  NOT_FOUND = 'Not Found',
}

type isResultStatus<V> = V extends RESULT_STATUS ? true : false

const isResultStatus = (status: any): status is RESULT_STATUS => {
  return Object.values(RESULT_STATUS).some((curStatus) => status === curStatus)
}

class ResultClass<V> {
  private statusMap = new Map<RESULT_STATUS, number>()
  constructor(private value: V) {}
  public get status (): RESULT_STATUS {
    return isResultStatus(this.value) ? this.value : RESULT_STATUS.OK
  }
  public get statusCode () {
    return match(this.status)
      .with(RESULT_STATUS.OK, () => this.statusMap.get(RESULT_STATUS.OK) || Status.OK)
      .with(RESULT_STATUS.CREATED, () => this.statusMap.get(RESULT_STATUS.CREATED) || Status.CREATED)
      .with(RESULT_STATUS.EXISTS, () => this.statusMap.get(RESULT_STATUS.EXISTS) || Status.METHOD_NOT_ALLOWED)
      .with(RESULT_STATUS.NOT_STORAGE, () => this.statusMap.get(RESULT_STATUS.NOT_STORAGE) || Status.METHOD_NOT_ALLOWED)
      .with(RESULT_STATUS.NOT_FOUND, () => this.statusMap.get(RESULT_STATUS.NOT_FOUND) || Status.NOT_FOUND)
      .otherwise(() => Status.INTERNAL_SERVER_ERROR)
  }
  public get data (): (V extends RESULT_STATUS ? undefined : V) {
    return (isResultStatus(this.value) ? undefined : this.value) as any
  }
  public setCustomStatusCode (status: RESULT_STATUS, code: number) {
    this.statusMap.set(status, code)
    return this
  }
}

function Result(v: RESULT_STATUS): ResultClass<RESULT_STATUS>
function Result<V>(v: V): ResultClass<V>
function Result(): ResultClass<undefined>
function Result<V>(v?: V) {
  if (lodash.isUndefined(v)) return new ResultClass(undefined)
  if (isResultStatus(v)) return new ResultClass(v)
  return new ResultClass(v)
}

export default Result
