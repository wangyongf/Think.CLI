import { Observable, Subject, ReplaySubject, from, of, range } from 'rxjs';
// import * as Rx from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import axios from 'axios';
import * as chalk from 'chalk';
import * as ora from 'ora';

export function ip() {
  // get your IP
  const spinner = ora('fetching your IP').start();
  spinner.color = 'yellow';
  const observable = from(axios.get('https://httpbin.org/ip')).pipe(
    map(response => response.data.origin),
    map(ipValue => chalk.default(`Your IP is ${ipValue}`))
  );
  const subscriber = {
    next: value => console.log('\n' + value),
    error: error => console.log(error),
    complete: () => {
      spinner.succeed('complete');
      spinner.stop();
    },
  };
  observable.subscribe(subscriber);
}
