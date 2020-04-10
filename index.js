export const CustomSelect = (function (document) {

  const builder = (select) => {
    let isOpen = false
    let id = ''
    let container
    let opener
    let panel
    let focusedOption
    let selectedOption
    let multiSelectedOptions = []

    const keyCodes = {
      SPACEBAR: 32,
      ENTER: 13,
      DOWN_ARROW: 40,
      UP_ARROW: 38,
      ESCAPE: 27,
      COMMAND: 91
    }

    const defaultParams = {
      containerClass: 'custom-select-container',
      openerClass: 'custom-select-opener',
      panelClass: 'custom-select-panel',
      optionClass: 'custom-select-option',
      optgroupClass: 'custom-select-optgroup',
      isSelectedClass: 'is-selected',
      hasFocusClass: 'has-focus',
      isDisabledClass: 'is-disabled',
      isOpenClass: 'is-open',
      isMultipleClass: 'is-multiple',
      isMultipleSelectedClass: 'is-multiple-selected'
    }

    const setFocusedOption = option => {
      focusedOption && focusedOption.classList.remove(defaultParams.hasFocusClass)

      if (option) {
        focusedOption = option
        focusedOption.classList.add(defaultParams.hasFocusClass)
        return isOpen && showFocusedOptions(option)
      }
    }

    const showFocusedOptions = (option) => {
      if (option.offsetTop < option.offsetParent.scrollTop) {
        option.offsetParent.scrollTop = option.offsetTop
      } else {
        option.offsetParent.scrollTop = (option.offsetTop + option.clientHeight) - option.offsetParent.clientHeight
      }
    }

    const moveFocusedOption = (e, direction) => {
      let nextFocusedIndex = typeof focusedOption === 'undefined' ? 0 : Number(focusedOption.dataset.index) + direction
      let panelId = e.target.getAttribute('aria-owns')
      let panel = e.target.classList.contains(defaultParams.openerClass) ? document.getElementById(panelId) : e.target
      let nextFocusedOption = panel.childNodes.item(nextFocusedIndex)

      return nextFocusedOption && setFocusedOption(nextFocusedOption)
    }

    const selectFromMultiSelect = option => {
      if (multiSelectedOptions.includes(option)) {
        multiSelectedOptions.filter(selectedOption => selectedOption !== option)
        option.classList.remove(defaultParams.isSelectedClass)
        option.classList.remove(defaultParams.isMultipleSelectedClass)
        option.removeAttribute('id')
      } else {
        option.classList.add(defaultParams.isSelectedClass)
        option.classList.add(defaultParams.isMultipleSelectedClass)
        multiSelectedOptions.push(option)
        option.setAttribute('id', `${id}-selectedOption`)
      }
    }

    const setSelectedOption = option => {

      if (selectedOption) {
        selectedOption.classList.remove(defaultParams.isSelectedClass)
        selectedOption.removeAttribute('id')
      }

      if (option && !!opener) {
        option.classList.add(defaultParams.isSelectedClass)
        option.setAttribute('id', `${id}-selectedOption`)
        selectedOption = option
        opener.firstChild.textContent = option.textContent
      } else if (option && option.parentNode && option.parentNode.classList.contains(defaultParams.isMultipleClass)) {
        selectFromMultiSelect(option)
      } else {
        selectedOption = option
        opener.firstChild.textContent = ''
      }
    }

    const togglePanel = state => {
      if (state || typeof state === 'undefined') {
        container.classList.add(defaultParams.isOpenClass)
        opener.setAttribute('aria-expanded', 'true')

        if (selectedOption) {
          panel.scrollTop = selectedOption.offsetTop
        }

        isOpen = true
      } else {
        container.classList.remove(defaultParams.isOpenClass)
        opener.setAttribute('aria-expanded', 'false')

        isOpen = false
      }
      return isOpen
    }


    const click = e => {
      if (opener && (e.target === opener || opener.contains(e.target))) {
        togglePanel(!isOpen)
      } else if (opener && (e.target.classList && e.target.classList.contains(defaultParams.optionClass) && panel.contains(e.target))) {
        setSelectedOption(e.target)
        togglePanel(false)

      } else if (isOpen && !container.contains(e.target)) {
        togglePanel(false)
      } else {
        setSelectedOption(e.target)
      }

    }

    const mouseoverEvent = e => {
      if (e.target.classList && e.target.classList.contains(defaultParams.optionClass)) {
        setFocusedOption(e.target)
      }
    }

    const keydownEvent = e => {
      if (!isOpen) {
        if (e.keyCode === keyCodes.DOWN_ARROW || e.keyCode === keyCodes.UP_ARROW || e.keyCode === keyCodes.SPACEBAR) {
          togglePanel()
        }
      } else {
        switch (e.keyCode) {
          case keyCodes.ENTER:
          case keyCodes.SPACEBAR:
            return setSelectedOption(focusedOption) && togglePanel(false)
          case keyCodes.ESCAPE:
            return togglePanel(false)
          case keyCodes.UP_ARROW:
            return moveFocusedOption(e, -1)
          case keyCodes.DOWN_ARROW:
            return moveFocusedOption(e, +1)
          default:
            return true
        }
      }
    }

    const addEvents = () => {
      container.addEventListener('click', click)
      panel.addEventListener('mouseover', mouseoverEvent)
      container.addEventListener('keydown', keydownEvent)
    }

    const parseOptions = (nodeList) => {
      let customList = []

      if (!nodeList.length) {
        throw new TypeError('Invalid Argument')
      }

      for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i] instanceof HTMLElement && nodeList[i].nodeName === 'OPTION') {
          const customOption = document.createElement('div')
          customOption.classList.add(defaultParams.optionClass)

          customOption.textContent = nodeList[i].text
          customOption.setAttribute('data-index', i.toString())
          customOption.setAttribute('role', 'option')
          nodeList[i].selected && setSelectedOption(customOption)

          customList.push(customOption)
        }
      }
      return customList
    }

    const insertOptions = (children) => {
      const node = children instanceof HTMLElement ? [children] : children
      const optionsToInsert = parseOptions(node)

      for (let i = 0; i < optionsToInsert.length; i++) {
        panel.appendChild(optionsToInsert[i])
      }
    }

    const generateId = () => {
      return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 6)
    }

    const buildSelect = () => {
      container = document.createElement('div')
      panel = document.createElement('div')

      container.classList.add(defaultParams.containerClass)
      panel.classList.add(defaultParams.panelClass)

      id = generateId()
      panel.id = `${id}-panel`

      if (select.multiple) {
        container.classList.add(defaultParams.isMultipleClass)
        panel.classList.add(defaultParams.isMultipleClass)
        panel.setAttribute('tabindex', '0')
      } else if (select.disabled) {
        container.classList.add(defaultParams.isDisabledClass)
      } else {
        opener = document.createElement('span')
        opener.classList.add(defaultParams.openerClass)
        opener.innerHTML = `<span>${(select.selectedIndex !== -1 ? select.options[select.selectedIndex].text : '')}</span>`
        opener.setAttribute('aria-owns', panel.id)
        opener.setAttribute('tabindex', '0')
        container.appendChild(opener)
      }

      addEvents()
      insertOptions(select.children)
      select.parentNode.replaceChild(container, select)
      container.appendChild(panel)

      return container
    }

    return buildSelect()
  }

  const init = () => {
    const allSelectList = [...document.querySelectorAll('select')]
    let selects = []
    allSelectList.map(selectItem => {
      if (selectItem instanceof HTMLElement && selectItem.nodeName === 'SELECT') {
        selects.push(builder(selectItem))
      }
    })

    return selects
  }

  return {
    init
  }

})(document)