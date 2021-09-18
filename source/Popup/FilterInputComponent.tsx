import React from "react";
import {Filter} from "./filter";

interface FilterProps {
  submitFilter: (filter: Filter) => void
}


export class FilterInputComponent extends React.Component<FilterProps, Filter> {
  constructor(props: FilterProps) {
    super(props);

    this.state = {
      pattern: '',
      newValue: ''
    };
  }

  submitFilter(){
    const filter: Filter = Object.assign({}, this.state);
    this.props.submitFilter(filter);

    this.setState({
      pattern: '',
      newValue: ''
    })
  }

  formChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Get the key and the value of the field that changed
    const key = event.target.name;
    const {value} = event.target;

    // Update the current state
    this.setState({
      ...this.state,
      [key]: value,
    });
  }

  render() {
    return (
      <div style={{display: 'flex'}} className={'filters'}>
        <input
          name='pattern'
          id='pattern'
          value={this.state.pattern.toString()}
          // defaultValue=''
          placeholder="regex or string"
          onChange={this.formChangeHandler}
        />
        <input
          name='newValue'
          id='newValue'
          value={this.state.newValue}
          // defaultValue=''
          placeholder="replace with"
          onChange={this.formChangeHandler}
        />
        <button id='regex-button-add' onClick={(_) => this.submitFilter()}>+</button>
      </div>
    )
  }
}
