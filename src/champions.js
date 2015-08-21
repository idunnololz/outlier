$(function() {

    var ChampionList = React.createClass({displayName: "ChampionList",
        render: function() {
            var championNodes = [];
            $.each(this.props.data, function (propertyName, valueOfProperty) {
                championNodes.push(
                    React.createElement(Champion, {data: valueOfProperty, key: propertyName})
                );
            });
            return (
                React.createElement("div", {className: "champion-list"}, 
                    championNodes
                )
            );
        }
    });

    var Champion = React.createClass({displayName: "Champion",
        handleClick: function(id) {
            window.location = '/champion/index.html?id=' + id;
        },
        render: function() {
            var champion = this.props.data;
            return (
                React.createElement("div", {className: "champion", onClick: this.handleClick.bind(this, champion.id)}, 
                    React.createElement("div", {className: "thumb", style: {"backgroundImage": "url(/res/autocomplete_mock/" + champion.image.full +")"}}), 
                    React.createElement("h2", null, champion.name)
                )
            );
        }
    });

    var ChampionsView = React.createClass({displayName: "ChampionsView",
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
                React.createElement("div", {className: "champion-view"}, 
                    React.createElement("h1", null, "champions"), 
                    React.createElement(ChampionList, {data: this.state.data})
                )
            );
        }
    });

    React.render(
      React.createElement(ChampionsView, {url: "champion.json"}),
      $("#main-content")[0]
    );

});