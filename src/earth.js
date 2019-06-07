import React from 'react';
import {Button} from '@material-ui/core';
import {withStore} from './store';
import { Viewer, Entity, BillboardGraphics, PolylineGraphics, LabelGraphics } from "resium";
import { Cartesian3, ArcGisMapServerImageryProvider, HorizontalOrigin, VerticalOrigin, Color } from "cesium";
import TLEJS from 'tle.js';
import SatIcon from './saticon.png';

const tlejs = new TLEJS();
const esri = new ArcGisMapServerImageryProvider({
	url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
});

class Earth extends React.Component {

	state = {
		positions: []
	}

	render() {
		const {store} = this.props;
		const tracking = store.get('tracking') || [];
		return(<div>
			<Button style={{zIndex: 1}} variant="contained" onClick={() => {
				this.props.store.set('drawerOpen', true);
			}} autoFocus={true}>Satellites</Button>
			<div id="credit"></div>
				<Viewer full timeline={false} animation={false} infoBox={false} 
					creditContainer={"credit"} imageryProvider={esri} navigationHelpButton={true}
					vrButton={false} homeButton={false} geocoder={false}>
					{tracking.map((o) => {
						const tleArr = [o.line1, o.line2];
						const latlng = tlejs.getLatLon(tleArr);
						let track = tlejs.getGroundTrackLngLat(tleArr);
						let positions = track[1].map(arr => Cartesian3.fromDegrees(arr[0], arr[1]));
						return <Entity key={o.name} position={Cartesian3.fromDegrees(latlng.lng, latlng.lat)}>
							<LabelGraphics text={o.name} horizontalOrigin={HorizontalOrigin.LEFT} VerticalOrigin={VerticalOrigin.TOP}/>
							<BillboardGraphics image={SatIcon} scale={0.1}/>
							<PolylineGraphics positions={positions} material={Color.DARKGOLDENROD}/>
						</Entity>})
					}
				</Viewer>
			</div>
		)
	}
}

export default withStore(Earth);