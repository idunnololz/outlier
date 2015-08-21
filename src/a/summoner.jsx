
$(function() {
    var QueryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
            // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        } 
        return query_string;
    }();
    
    var core = [];
    var champLib = [];

    var ProfileDiv = React.createClass({
        render: function() {
            var division;
            if (this.props.data.division != undefined) {
                division = (
                    <h3>{this.props.data.division.toUpperCase()}</h3>
                );
            }
            return (
                <div className="profile-div themed-light">
                    <img className="summoner-profile-img" src={this.props.data.summonerProfileSrc}/>
                    <div>
                        <h1>{this.props.data.summonerName}</h1>
                        {division}
                    </div>
                </div>
            );
        }
    });

    var UserView = React.createClass({
        getInitialState: function() {
            return {
                data: {
                    summonerName: QueryString.search,
                    builds: []
                },
                loaded: false
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON(this.props.url, function(json) {
                    core.data = json;
                }),

                $.getJSON("/res/summoner.json", function(summoners) {
                    core.summoners = summoners;
                }),

                $.getJSON("/res/item.json", function(items) {
                    core.items = items;
                }),

                $.getScript("/buildlist.js")
            ).then(function() {
                // do a bit of preprocessing

                $.each(core.data.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners.data[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners.data[val.summonerSpells[1]];
                });

                this.setState({data: core.data, loaded: true});
            }.bind(this));
        },
        render: function() {
            var buildlist;
            if (this.state.loaded) {
                buildlist = (<BuildList data={this.state.data.builds} core={core} />);
            }
            return (
                <div>
                    <ProfileDiv data={this.state.data} />
                    {buildlist}
                </div>
            );
        }
    });

    var url = "";
    if (QueryString.search === "idunnololz") {
        url = "builds.json";
    }
    React.render(
      <UserView url={url}/>,
      $("#main-content")[0]
    );

});