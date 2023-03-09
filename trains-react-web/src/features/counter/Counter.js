import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { counterActions } from '../../store/counter.slice'
import styles from './Counter.module.css'

export function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(counterActions.increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(counterActions.decrement())}
        >
          Decrement
        </button>
      </div>
    </div>
  )
}