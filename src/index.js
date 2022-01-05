import React from 'react';
import ReactDOM from 'react-dom';

import '@fontsource/roboto/400.css';

import './normalize.css';
import './index.css';

import {StyledEngineProvider} from '@mui/material/styles';
import {DataGrid} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField} from "@mui/material";

class NodesTable extends React.Component {

    render() {
        const columns = [
            {field: 'id', headerName: 'ID', width: 130},
            {field: 'host', headerName: 'Host', width: 200},
            {field: 'port', headerName: 'Port', width: 130},
            {field: 'active', headerName: 'Active', type: 'boolean', width: 130},
            {field: 'state', headerName: 'State', width: 130},
            {field: 'electionTimeout', headerName: 'Election timeout', width: 220},
        ];

        return (
            <div className="nodesTable">
                <DataGrid
                    rows={this.props.nodes}
                    columns={columns}
                    pageSize={4}
                    rowsPerPageOptions={[4]}
                    checkboxSelection
                    onSelectionModelChange={(ids) => {
                        const selectedIDs = new Set(ids);
                        const selectedRowData = this.props.nodes.filter((row) =>
                            selectedIDs.has(row.id) && this.props.selectedNode !== row
                        );
                        this.props.setSelectedNode(selectedRowData[0]);
                    }}
                    selectionModel={this.props.selectedNode ? [this.props.selectedNode.id] : []}
                />
            </div>
        );
    }
}

class ControlBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            key: '',
            value: ''
        }

        this.handleValueTextFieldChange = this.handleValueTextFieldChange.bind(this);
        this.handleSubmitButton = this.handleSubmitButton.bind(this);
    }

    handleOpen = () => {
        this.setState({
            isOpen: true
        })
    }

    handleClose = () => {
        this.setState({
            isOpen: false
        })
    }

    handleKeyTextFieldChange = (e) => {
        this.setState({
            key: e.target.value
        });
    }

    handleValueTextFieldChange(e) {
        this.setState({
            value: e.target.value
        });
    }

    handleSubmitButton() {
        const key = this.state.key;
        const value = this.state.value;

        const data = {
            key: +key,
            val: value
        }

        this.props.addData(data);
        this.setState({
            isOpen: false,
            key: '',
            value: ''
        })
    }

    render() {
        const {refreshData} = this.props;

        return (
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <ButtonGroup variant="contained" aria-label="outlined primary button group">
                    <Button onClick={this.props.startNode}>Start</Button>
                    <Button onClick={this.props.stopNode}>Stop</Button>
                    <Button onClick={this.props.retrieveData}>Retrieve data</Button>
                </ButtonGroup>

                <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ml: "auto"}}>
                    <Button onClick={this.handleOpen}>Add data</Button>
                    <Button onClick={refreshData}>Refresh</Button>
                </ButtonGroup>

                <Dialog open={this.state.isOpen} onClose={this.handleClose}>
                    <DialogTitle>Add data to cluster</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="key"
                            label="Key"
                            type="number"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            value={this.state.key}
                            onChange={this.handleKeyTextFieldChange}
                        />
                        <TextField
                            margin="dense"
                            id="value"
                            label="Value"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.value}
                            onChange={this.handleValueTextFieldChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button onClick={this.handleSubmitButton}>Submit</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nodes: [],
            selectedNode: '',
            retrievedNodeData: ''
        }

        this.setSelectedNode = this.setSelectedNode.bind(this);
        this.refreshData = this.refreshData.bind(this);
        this.stopNode = this.stopNode.bind(this);
        this.startNode = this.startNode.bind(this);
        this.addData = this.addData.bind(this);
        this.retrieveData = this.retrieveData.bind(this);
    }

    componentDidMount() {
        this.refreshData();
    }

    setSelectedNode(node) {
        this.setState({
            selectedNode: node
        });
    }

    refreshData() {
        fetch('/api/v1/context')
            .then(response => response.json())
            .then(data => this.setState({
                nodes: data
            }));
    }

    retrieveData() {
        const node = this.state.selectedNode;

        fetch('/api/v1/storage?peerId=' + node.id)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    selectedNode: '',
                    retrievedNodeData: 'Node #' + node.id + '\n\n' + JSON.stringify(data, null, 4)
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    addData(data) {
        fetch('/api/v1/storage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(data => {

            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    stopNode() {
        const node = this.state.selectedNode;

        fetch('/api/v1/context/stop?peerId=' + node.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(data => {
                this.setState({
                    selectedNode: ''
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    startNode() {
        const node = this.state.selectedNode;

        fetch('/api/v1/context/start?peerId=' + node.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(data => {
                this.setState({
                    selectedNode: ''
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    render() {
        return (
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                className="board"
            >
                <h1>Cluster #1</h1>

                <ControlBar refreshData={this.refreshData}
                            startNode={this.startNode}
                            stopNode={this.stopNode}
                            addData={this.addData}
                            retrieveData={this.retrieveData}/>

                <NodesTable nodes={this.state.nodes}
                            setSelectedNode={this.setSelectedNode}
                            selectedNode={this.state.selectedNode}/>

                <TextField
                    id="outlined-multiline-static"
                    label="Cluster Info"
                    multiline
                    rows={30}
                    placeholder="No info available"
                    className="info"
                    disabled="on"
                    value={this.state.retrievedNodeData}
                />
            </Grid>
        );
    }
}

// ========================================

ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <Board/>
    </StyledEngineProvider>,
    document.getElementById('root')
);
