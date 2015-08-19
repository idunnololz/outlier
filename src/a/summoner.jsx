
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

    console.log(QueryString.search);
    
    var core = [];

    var ProfileDiv = React.createClass({
        render: function() {
            var division;
            if (this.props.data.division != undefined) {
                var division = (
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

    var BuildList = React.createClass({
        render: function() {
            var buildNodes = this.props.data.map(function (build, i) {
                return (
                    <Build build={build} key={i}>
                    </Build>
                );
            });
            return (
                <div className="commentList">
                    {buildNodes}
                </div>
            );
        }
    });

    var Build = React.createClass({
        render: function() {
            var build = this.props.build;
            var itemBuild = [];
            if (build.itemBuild != undefined) {
                itemBuild = build.itemBuild.map(function (item, i) {
                    return (
                        <img 
                            className={item.primary ? "primary-item" : "item"} 
                            src={"/res/item/" + core.items.data[item.id].image.full}
                            key={i}/>
                    );
                });
            }
            return (
                <div className="build themed-light">
                    <div className="build-left-col">
                        <img className="champion-profile-img" title={build.champion} src={"/res/autocomplete_mock/" + build.champion + ".png"}/>
                        <img className="summoner-spell-1-img" title={build.summonerSpells[0].name} src={"/res/spell/" + build.summonerSpells[0].image.full}/>
                        <img className="summoner-spell-2-img" title={build.summonerSpells[1].name} src={"/res/spell/" + build.summonerSpells[1].image.full}/>
                    </div>
                    <div className="build-right-col">
                        <table className="flex-align-top">
                            <tr>
                                <td><h4>role</h4></td>
                                <td><h3>{this.props.build.role}</h3></td>
                            </tr>
                            <tr>
                                <td><h4>win rate</h4></td>
                                <td><h3>{this.props.build.winrate + "%"}</h3></td>
                            </tr>
                            <tr>
                                <td><h4>build</h4></td>
                            </tr>
                        </table>
                        <div className="item-build">
                            <div className="item-order-bg"/>
                            {itemBuild}
                        </div>
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
                }
            };
        },
        componentDidMount: function() {
            $.when(
                $.getJSON(this.props.url, function(json) {
                    core.data = json;
                }),

                $.getJSON("summoner.json", function(summoners) {
                    core.summoners = summoners;
                }),

                $.getJSON("item.json", function(items) {
                    core.items = items;
                })
            ).then(function() {
                // do a bit of preprocessing

                $.each(core.data.builds, function(index, val) {
                    val.summonerSpells[0] = core.summoners.data[val.summonerSpells[0]];
                    val.summonerSpells[1] = core.summoners.data[val.summonerSpells[1]];
                });

                this.setState({data: core.data});
            }.bind(this));
        },
        render: function() {
            return (
                <div>
                    <ProfileDiv data={this.state.data} />
                    <BuildList data={this.state.data.builds} />
                </div>
            );
        }
    });

    React.render(
      <UserView url="builds.json"/>,
      $("#main-content")[0]
    );

});