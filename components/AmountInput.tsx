import React, { useEffect } from 'react'

interface AmountInputProps {
  value: string
  setValue: any
  localValue?: string
  setLocalValue?: any // React.Dispatch<React.SetStateAction<string>> | React.Dispatch<React.SetStateAction<number>>;
  // setValue: (e: React.ChangeEvent<HTMLInputElement>) => void;  // Updated type
  setError?: React.Dispatch<React.SetStateAction<boolean>>
  isTyping?: boolean
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>
  className?: string
  placeholder?: string
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  setValue,
  localValue,
  setLocalValue,
  isTyping,
  setIsTyping,
  className,
  placeholder = '0',
}) => {
  useEffect(() => {
    if (setLocalValue) {
      setLocalValue(value)
    }
  }, [value])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setIsTyping) {
      setIsTyping(true)
    }

    let val = e.target.value.replace(/[^0-9.]/g, '')

    if (val.startsWith('.')) {
      val = '0' + val
    }

    let [integerPart, decimalPart] = val.split('.')

    // Check if integer part has leading zeroes followed by other digits.
    if (/^0[1-9]+/.test(integerPart)) {
      // If true, remove leading zeroes.
      integerPart = integerPart.replace(/^0+/, '')
    } else if (/^0+$/.test(integerPart)) {
      // If the integer part is only zeros, default to a single '0'.
      integerPart = '0'
    }

    val =
      decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart
    // if (val !== value) {
    //     setValue(val);
    // }

    if (val === '') {
      val = '0'
    }
    if (val !== localValue) {
      // should this be value or localValue?
      if (setLocalValue) {
        setLocalValue(val)
      }
      setValue(val)
    }
  }

  // const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  //     let inputValue = e.target.value;

  //     // if decimalPart only consists of zeroes, then remove.
  //     let [integerPart, decimalPart] = inputValue.split('.');
  //     if (decimalPart && /^0+$/.test(decimalPart)) {
  //         inputValue = integerPart
  //     }

  //     inputValue = inputValue.replace(/(\.\d*[1-9])0+$/, '$1');
  //     inputValue = inputValue.replace(/\.$/, '');
  //     setValue(inputValue);
  // };

  const handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // if (e.target.value === '0') {
    //     e.target.select();
    // } else {
    //     e.target.value = '';
    // }
    e.target.select()
  }

  return (
    <input
      type="text"
      // value={value}
      value={localValue}
      onChange={handleOnChange}
      // onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      className={className}
      placeholder={placeholder}
    />
  )
}

export default AmountInput
