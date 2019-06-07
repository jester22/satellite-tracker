import React from 'react';
import {Drawer, withStyles, List, Divider, ListItem, ListItemText, ListItemIcon, TextField} from '@material-ui/core';
import {AddCircle, RemoveCircle} from '@material-ui/icons';
import {withStore} from './store';

const styles = {
	list: {
		width: 250,
	}
};

class MyDrawer extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			searchText: '',
			searchResult: []
		}
	}

	componentDidMount() {
		this.reQuery();
	}
	
	reQuery = async () => {
		let tracking = this.props.store.get('tracking') || [];
		let promises = [];
		for (const o of tracking) {
			promises.push(fetch(`https://data.ivanstanojevic.me/api/tle/${o.satelliteId}`));
		}
		let values = await Promise.all(promises);
		let sats = await Promise.all(values.map(o => o.json()));
		this.props.store.set('tracking', sats);
		setTimeout(() => {
			this.reQuery();
		}, 1000 * 3);
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};

	handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			if(this.state.searchText) {
				fetch(`https://data.ivanstanojevic.me/api/tle?search=${this.state.searchText}`)
					.then((res) => {
						return res.json();
					})
					.then((json) => {
						this.setState({searchResult: json.member})
					})
					.catch((err) => {
						console.log(err);
					})
			}
		}
	}

	toggleDrawer = (open) => event => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
		this.props.store.set('drawerOpen', open);
	};

	render() {
		const {classes, store} = this.props;
		let tracking = store.get('tracking') || [];
		return <Drawer open={this.props.store.get('drawerOpen')} onClose={this.toggleDrawer(false)}><div
				className={classes.list}
				role="presentation"
			>
			<List>
				<ListItem>
				<TextField
					id="outlined-search"
					label="Search by Satellite Name"
					type="search"
					margin="normal"
					variant="outlined"
					onChange={this.handleChange('searchText')}
					autoFocus={true}
					onKeyDown={this.handleKeyDown}
				/>
				</ListItem>
			</List>
			<Divider />
			<List style={{maxHeight: 250, overflowY: 'auto'}}>
				<ListItem>
					<ListItemText secondary={'Search Result'} />
				</ListItem>
				{this.state.searchResult.map((o, index) => (
				<ListItem button key={o.name} disabled={Boolean(tracking.find((t) => t.satelliteId === o.satelliteId))}
				onClick={() => {
					this.props.store.set('tracking', tracking.concat(o));
				}}>
					<ListItemText primary={o.name} />
					<ListItemIcon>
						<AddCircle/>
					</ListItemIcon>
				</ListItem>
				))}
			</List>
			<List>
				<ListItem>
					<ListItemText secondary={'Tracking'} />
				</ListItem>
				{tracking.map((o, index) => (
				<ListItem button key={o.name} onClick={() => {
					this.props.store.set('tracking', tracking.filter((t) => t.satelliteId !== o.satelliteId));
				}}>
					<ListItemText primary={o.name} />
					<ListItemIcon>
						<RemoveCircle/>
					</ListItemIcon>
				</ListItem>
				))}
			</List>
			</div>
		</Drawer> 
	}
}

export default withStyles(styles)(withStore(MyDrawer));