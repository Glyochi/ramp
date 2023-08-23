import classNames from "classnames"
import { useRef, useState } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        className={classNames("RampInputCheckbox--label", (checked ? "RampInputCheckbox--label-checked" : ""), {
          "RampInputCheckbox--label-disabled": disabled,
        })}
        onClick={() => {
          let input = document.getElementById(inputId) as HTMLInputElement;
          input.click();
        }}
      />
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}

      />
    </div>
  )
}
