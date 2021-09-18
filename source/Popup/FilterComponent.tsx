import React from "react";
import {Filter} from "./filter";

interface FilterProps {
  index: number,
  filter: Filter,
  deleteFilter: (i: number) => void
}

export class FilterComponent extends React.Component<FilterProps> {
  constructor(props: FilterProps) {
    super(props);
  }

  render() {
    const index = this.props.index;
    const filter: Filter = this.props.filter;

    return (
      <div style={{display: 'flex'}} className={'filters'}>
        <input
          name={`regex-${index}`}
          id={`regex-${index}`}
          value={filter.pattern.toString()}
          disabled={true}
        />
        <input
          name={`value-${index}`}
          id={`value-${index}`}
          value={filter.newValue}
          disabled={true}
        />
        <button id={`regex-button-delete-${index}`} onClick={(_) => this.props.deleteFilter(index)}>-</button>
      </div>
    )
  }
}
