import React from 'react';
import {browser} from 'webextension-polyfill-ts';
import {Filter} from "./filter";
import {FilterComponent} from "./FilterComponent";
import {FilterInputComponent} from "./FilterInputComponent";
import './styles.scss'

interface SettingsState {
  active: boolean;
  syncScroll: boolean;
  userFilters: Filter[]
  grammarlyInstalled: boolean;
}


export class Popup extends React.Component<unknown, SettingsState> {
  constructor(props: unknown) {
    super(props);

    // Init state
    this.state = {
      active: false,
      syncScroll: false,
      userFilters: [],
      grammarlyInstalled: false
    };

    // Update state from storage
    browser.storage.sync
      .get(['active'])
      .then((result) => this.setState({
        ...this.state,
        active: result.active ?? true,
      }));

    browser.storage.sync
      .get(['syncScroll'])
      .then((result) => this.setState({
        ...this.state,
        syncScroll: result.syncScroll ?? true,
      }));

    browser.storage.sync
      .get(['customRegex'])
      .then((result) => this.setState({
        ...this.state,
        userFilters: result.customRegex ?? [],
      }));

    this.grammarlyInstalled()
      .then((result) => this.setState({
        ...this.state,
        grammarlyInstalled: result ?? false,
      }));
  }

  checkboxChangeHandler = (
    event:
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    // Get the key and the value of the field that changed
    const key = event.target.name;
    const value = event.target.checked;

    // Update the current state
    this.setState({
      ...this.state,
      [key]: value,
    });

    browser.storage.sync.set({[key]: value});
  };

  deleteFilter(index: number) {
    const filters: Filter[] = Object.assign(this.state.userFilters ?? []);
    filters.splice(index, 1);

    this.setState({
      ...this.state,
      userFilters: filters
    });

    browser.storage.sync.set({customRegex: filters});
  }

  submitFilter(filter: Filter) {
    const newFilters: Filter[] = Object.assign(this.state.userFilters ?? []);
    newFilters.push(filter)

    this.setState({
      ...this.state,
      userFilters: newFilters
    });

    browser.storage.sync.set({customRegex: newFilters});
  }

  grammarlyInstalled(): Promise<boolean> {
    return browser.tabs.executeScript({code: 'document.getElementsByTagName(\'grammarly-desktop-integration\').length>0'}).then(x => x[0]);
  }

  openDonate() {
    browser.tabs.create({url: 'https://www.paypal.com/donate/?hosted_button_id=6B3GESXVWUPAJ'});
  }

  openFilterHelp() {
    browser.tabs.create({url: 'https://github.com/robindijkhof/overleaf-textarea#custom-filters'});
  }

  openAffiliate() {
    browser.tabs.create({url: 'https://grammarly.go2cloud.org/aff_c?offer_id=3&aff_id=78579'});
  }

  render(): React.ReactNode {
    const grammarlyMessage = this.state.grammarlyInstalled ? 'Have you considered Grammarly Premium?' : 'This plugin works best with Grammarly.'

    return (
      <div style={{width: 400, margin: 'auto'}}>
        <h2>Overleaf textarea</h2>
        <p>
          {grammarlyMessage}
          &nbsp;
          <a onClick={() => this.openAffiliate()} href="https://grammarly.go2cloud.org/aff_c?offer_id=3&aff_id=78579">Get it now using this affiliate
            link.</a>
        </p>
        <form>
          <label>
            Active:
            <input
              name="active"
              type="checkbox"
              checked={this.state.active}
              onChange={this.checkboxChangeHandler}/>
          </label>
          <br/>
          <label>
            Sync-scroll:
            <input
              name="syncScroll"
              type="checkbox"
              checked={this.state.syncScroll}
              onChange={this.checkboxChangeHandler}/>
          </label>
        </form>

        <form style={{marginBottom: '12px', marginTop: '12px'}}>
          <input id="donate-link" type="image" onClick={() => this.openDonate()} src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif"
                 name="submit"
                 title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button"/>
        </form>

        Add custom filters <a onClick={() => this.openFilterHelp()} id="help-filter-link"
                              href="https://github.com/robindijkhof/overleaf-textarea#custom-filters">???</a>
        <FilterInputComponent submitFilter={(x) => this.submitFilter(x)}/>
        <br/>
        Existing custom filters
        {this.state.userFilters?.map((value, index) => <FilterComponent index={index} filter={value} deleteFilter={(x) => this.deleteFilter(x)}/>)}
      </div>
    );
  }
}
