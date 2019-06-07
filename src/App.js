import React from 'react';
import {createStore} from './store';
import Drawer from './drawer';
import Earth from './earth';

class App extends React.Component {

	render() {
		return <div>
			<Drawer/>
			<Earth/>
		</div>
	}
}

export default createStore(App);