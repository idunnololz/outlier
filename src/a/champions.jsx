$(function() {

    var ChampionList = React.createClass({
        render: function() {
            var championNodes = [];
            $.each(this.props.data, function (propertyName, valueOfProperty) {
                championNodes.push(
                    <Champion data={valueOfProperty} key={propertyName}/>
                );
            });
            return (
                <div className="champion-list">
                    {championNodes}
                </div>
            );
        }
    });

    var Champion = React.createClass({
        handleClick: function(id) {
            window.location = '/champion/index.html?id=' + id;
        },
        render: function() {
            var champion = this.props.data;
            return (
                <div className="champion" onClick={this.handleClick.bind(this, champion.id)}>
                    <div className="thumb" style={{"backgroundImage": "url(/res/autocomplete_mock/" + champion.image.full +")"}}/>
                    <h2>{champion.name}</h2>
                </div>
            );
        }
    });

    var ChampionsView = React.createClass({
        getInitialState: function() {
            return {
                data: []
            };
        },
        componentDidMount: function() {
            var champions;
            $.when(
                $.getJSON(this.props.url, function(json) {
                    champions = json;
                })
            ).then(function() {
                this.setState({data: champions.data});
            }.bind(this));
        },
        render: function() {
            return (
                <div className="champion-view">
                    <h1>champions</h1>
                    <ChampionList data={this.state.data}/>
                </div>
            );
        }
    });

    React.render(
      <ChampionsView url={"champion.json"}/>,
      $("#main-content")[0]
    );

});