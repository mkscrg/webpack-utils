// @flow
import React from 'react';

import styles from './HelloWorld.css';


export default class HelloWorld extends React.Component<void, {}, void> {
  static mkContent(): string {
    return 'Sup globe 🌍';
  }
  render() {
    return (
      <span className={styles.HelloWorld}>{HelloWorld.mkContent()}</span>
    );
  }
}
