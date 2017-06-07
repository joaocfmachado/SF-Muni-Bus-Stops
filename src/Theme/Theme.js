import getMuiTheme from 'material-ui/styles/getMuiTheme';

const getTheme = () => {
	const muiTheme = getMuiTheme({
		fontFamily: 'Montserrat, sans-serif',
	});
	return muiTheme;
};

export { getTheme };

export default {
	getTheme,
};
