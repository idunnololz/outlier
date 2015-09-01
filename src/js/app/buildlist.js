define(['jquery', 'React'], function ($, React) {
    function makeArray(w, h, val) {
        var arr = [];
        for(i = 0; i < h; i++) {
            arr[i] = [];
            for(j = 0; j < w; j++) {
                arr[i][j] = val;
            }
        }
        return arr;
    }

    function getRoleName(role, lane) {
        if (role === "SOLO" && lane === "MIDDLE") {
            return "Solo mid";
        } else if (role === "DUO_CARRY" && lane === "MIDDLE") {
            return "Duo mid";
        } else if (role === "DUO_SUPPORT") {
            return "Support";
        }
        
        return role + " " + lane;
    }

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    const SHOW_MAIN = 1;
    const SHOW_RUNES_MASTERIES = 2;
    var BuildList = React.createClass({displayName: "BuildList",
        getInitialState:function() {
            return {
                champLib: [],
                buildView: [],
                animate: false,
                changed: -1
            };
        },
        loadDataForBuilds:function(builds) {
            var champLib = this.state.champLib;
            var champLibProp = this.props.champLib;

            var changed = false;
            var buildView = this.state.buildView;
            this.props.data.map(function (build, i) {
                if (buildView[i] === undefined) {
                    buildView[i] = SHOW_MAIN;
                    changed = true;
                }
            });
            if (changed) {
                this.setState({'buildView': buildView, changed: -1});
            }

            builds.map(function (build, i) {
                var champion = build.champion;
                if (champLib[champion] === undefined) {
                    if (champLibProp[champion] !== undefined) {
                        champLib[champion] = champLibProp[champion];
                        this.setState({changed: -1});
                    } else {
                        $.getJSON("/res/champion/" + champion + ".json", function(json) {
                            champLib[champion] = json.data[champion];
                            this.setState({'champLib': champLib, changed: -1});
                        }.bind(this));
                    }
                }
            }.bind(this));
        },
        componentDidMount:function() {
            this.loadDataForBuilds(this.props.data);
        },
        componentWillReceiveProps:function(nextProps) {
            this.loadDataForBuilds(nextProps.data);
        },
        onSwitchView:function(index) {
            var buildView = this.state.buildView;
            if (buildView[index] === SHOW_MAIN) {
                buildView[index] = SHOW_RUNES_MASTERIES;
            } else if (buildView[index] === SHOW_RUNES_MASTERIES) {
                buildView[index] = SHOW_MAIN;
            }

            this.setState({'buildView': buildView, animate: true, changed: index});
        },
        render:function() {
            var champLib = this.state.champLib;
            var buildView = this.state.buildView;
            var needRunesAndMasteryInfo = false;

            var buildNodes = this.props.data.map(function (build, i) {
                var swapping = this.state.changed !== -1;
                var shouldIgnore = swapping && i !== this.state.changed;

                if (buildView[i] === SHOW_MAIN) {
                    return (
                        React.createElement(Build, {
                            ignore: shouldIgnore, 
                            build: build, 
                            key: "Build" + i, 
                            core: this.props.core, 
                            champLib: champLib, 
                            onSwitchView: this.onSwitchView.bind(this, i)}
                        )
                    );
                } else if (buildView[i] === SHOW_RUNES_MASTERIES) {
                    needRunesAndMasteryInfo = true;
                    return (
                        React.createElement(RunesAndMasteries, {
                            ignore: shouldIgnore, 
                            build: build, 
                            key: "RunesAndMasteries" + i, 
                            core: this.props.core, 
                            champLib: champLib, 
                            onSwitchView: this.onSwitchView.bind(this, i)}
                        )
                    );
                }
            }.bind(this));

            if (needRunesAndMasteryInfo && this.props.core.masteryData === undefined) {
                this.props.loader.loadRuneAndMasteryData();
            }

            return (
                React.createElement("div", {className: "build-list"}, 
                    React.createElement(ReactCSSTransitionGroup, {transitionName: "slide", transitionLeave: false, transitionEnter: this.state.animate}, 
                        buildNodes
                    )
                )
            );
        }
    });

    const MAX_TIME_BETWEEN_BLOCKS = 10000; // 10s

    var Build = React.createClass({displayName: "Build",
        fetchSpecialSummonerSpell:function(summoners) {
            if (summoners[0].id === "SummonerFlash") {
                return summoners[1].id; 
            }
            return summoners[0].id;
        },
        handleGetItemSetClick:function(e) {
            var $target = $(e.target);
            var build = this.props.build;
            var finalItems = [];

            if ($target.text() !== "Get ItemSet") return;

            $target.text("Generating...");

            var elemToItemSetItem = function(elem)  {
                return {
                    id: elem.itemId.toString(),
                    count: 1
                };
            };

            setTimeout(function()  {
                var itemBuild = build.itemEvents;

                console.log(itemBuild);
                itemBuild = itemBuild.filter(function(elem)  {
                    return (elem.itemId !== "2010");
                });

                var items = $.map(itemBuild, function(elem, index) {
                    var itemSetItem = elemToItemSetItem(elem);

                    if (elem.is_final_item) {
                        finalItems.push(itemSetItem);
                    }
                    return itemSetItem;
                });

                var blocks = [];

                var lastItems = [];
                var itemSetItems = [];
                for (var i = 0; i < itemBuild.length; i++) {
                    var elem = itemBuild[i];
                    var firstItem = lastItems.length === 0;
                    if (!firstItem) {
                        var lastTime = lastItems[lastItems.length - 1].timestamp;
                        if (elem.timestamp - lastTime > MAX_TIME_BETWEEN_BLOCKS) {
                            var sectionName = blocks.length === 0 ? "First build this" : "Then build this";
                            blocks.push({
                                type: sectionName,
                                'items': itemSetItems
                            });

                            lastItems = [];
                            itemSetItems = [];
                        }
                    }

                    lastItems.push(elem);
                    itemSetItems.push(elemToItemSetItem(elem));
                }
                blocks.push({
                    type: "Finally build this",
                    'items': itemSetItems
                });

                blocks.push({
                    type: "Complete build order",
                    'items': items
                });

                blocks.push({
                    type: "Full build",
                    'items': finalItems
                });

                var name = build.champion + "-" + build.role + "-" + build.lane;

                var itemSet = {
                    title: name,
                    type: "custom",
                    map: "SR",
                    mode: "any",
                    'blocks': blocks
                };

                $.when(
                    $.getScript("/libs/Blob.min.js"),
                    $.getScript("/libs/FileSaver.min.js")
                ).then(function() {
                    $target.text("Get ItemSet");
                    var blob = new Blob([JSON.stringify(itemSet)], {type: "application/json;charset=utf-8"});
                    saveAs(blob, name + ".json");
                }.bind(this));
            }.bind(this), 1);

            console.log(build);

        },
        useDefaultTooltip:function(component) {
            if (component == undefined) return;
            var $elem = $(component.getDOMNode());
            var title = $elem.attr('title');
            $elem.removeAttr('title');
            $elem.mouseover(function()  {
                tooltip.pop($elem[0], title);
            });
            $elem.click(function()  {
                tooltip.pop($elem[0], title);
            });
        },
        shouldComponentUpdate:function(nextProps, nextState) {
            return !nextProps.ignore;
        },
        switchView:function(event) {
            var $toAnimate = $(React.findDOMNode(this.refs.root));
            $toAnimate.on("transitionend", function(e)  {
                $toAnimate.off(e);
                this.props.onSwitchView();
            }.bind(this));
            $toAnimate.addClass("dismiss");
        },
        render:function() {
            var champLib = this.props.champLib;
            var core = this.props.core;
            var build = this.props.build;
            var itemBuild = [];
            var skillOrder = [];
            var champData = champLib[build.champion];
            var itemBuildRaw = build.itemEvents;
            if (itemBuildRaw != undefined) {
                var length = itemBuildRaw.length;
                var itemBuild = [];
                var finalBuild = [];

                $.each(itemBuildRaw, function(index, item)  {
                    console.log(item.itemId);
                    if (item.is_final_item) {
                        finalBuild.push(
                            React.createElement("img", {
                                className: item.is_final_item ? "primary-item" : "item", 
                                src: "/res/item/" + core.items.data[item.itemId].image.full, 
                                key: index, 
                                title: core.items.data[item.itemId].name, 
                                ref: this.useDefaultTooltip})
                        );
                    }

                    itemBuild.push(
                        React.createElement("img", {
                            className: item.is_final_item ? "primary-item" : "item", 
                            src: "/res/item/" + core.items.data[item.itemId].image.full, 
                            key: index, 
                            title: core.items.data[item.itemId].name, 
                            ref: this.useDefaultTooltip})
                    );

                    if (length - 1 != index) {
                        itemBuild.push(React.createElement("div", {className: "bridge", key: index+"bridge"}));
                    }
                }.bind(this));
            }

            if (build.skillups != undefined && champData != undefined) {
                var skillArr = makeArray(18, 5, 0);

                $.each(build.skillups, function(index, val) {
                    skillArr[val+1][index] = 1;
                });

                var skillLetter = "QWER";

                function generateRowForPassive(arr) {
                    var row = [];
                    row.push(React.createElement("td", {key: "generateRowForPassive-1", className: "td-center nb-top-right-left"}, React.createElement("img", {className: "spell-icon", src: "/res/passive/" + champData.passive.image.full})));
                    row.push(React.createElement("td", {key: "generateRowForPassive-3", className: "spell-name-col nb-top-left"}, React.createElement("h1", null, champData.passive.name.toLowerCase())));
                    $.each(arr, function(index, val)  {
                        var c = "nb-top";
                        if (index + 1 == arr.length) {
                            c = "nb-top-right";
                        }
                        row.push(React.createElement("td", {key: "generateRowForPassive-" + (index + 10), className: c + " skill-slot"}));
                    });
                    return row;
                }

                function generateRowForSpell(index, arr) {
                    var borderClass1 = "nb-top-right-left";
                    var borderClass2 = "nb-top-left";
                    var borderClass3 = "";
                    var borderClass4 = "nb-right";
                    if (index === 3) {
                        borderClass1 = "nb";
                        borderClass2 = "nb-top-bottom-left";
                        borderClass3 = "nb-bottom";
                        borderClass4 = "nb-bottom-right";
                    }
                    var row = [];
                    row.push(
                        React.createElement("td", {key: "generateRowForSpell-1", className: "td-center " + borderClass1}, 
                            React.createElement("span", {className: "spell-icon-key"}, 
                                React.createElement("img", {className: "spell-icon", src: "/res/spell/" + champData.spells[index].image.full}), 
                                React.createElement("h2", null, skillLetter.charAt(index))
                            )
                        ));
                    row.push(React.createElement("td", {key: "generateRowForSpell-3", className: borderClass2}, React.createElement("h1", null, champData.spells[index].name.toLowerCase())));
                    $.each(arr, function(index, val)  {
                        var cellContent = val === 0 ? [] : (
                            // if this cell should be a skill up
                            React.createElement("div", {className: "level"}, index + 1)
                        );
                        var c = borderClass3;
                        if (index + 1 === arr.length) {
                            c = borderClass4;
                        }
                        row.push(
                            React.createElement("td", {key: "generateRowForSpell-" + (index + 10), className: "skill-slot " + c}, 
                                cellContent
                            ));
                    });
                    return row;
                }

                skillOrder = (
                    React.createElement("div", {className: "skill-order-table-container"}, 
                        React.createElement("table", {className: "skill-order"}, 
                            React.createElement("tr", null, " ", generateRowForPassive(skillArr[0]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(0, skillArr[1]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(1, skillArr[2]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(2, skillArr[3]), " "), 
                            React.createElement("tr", null, " ", generateRowForSpell(3, skillArr[4]), " ")
                        )
                    )
                );
            }

            var roleName = getRoleName(this.props.build.role, this.props.build.lane);

            return (
                React.createElement("div", {className: "build themed-light", ref: "root"}, 
                    React.createElement("div", {className: "show-runes-masteries-container"}, 
                        React.createElement("div", {className: "button-show-runes-masteries", onClick: this.switchView}, "Runes & Masteries >"), 
                        React.createElement("div", {className: "fold"})
                    ), 
                    React.createElement("div", {className: "build-top"}, 
                        React.createElement("div", {className: "build-left-col"}, 
                            React.createElement("div", {ref: this.useDefaultTooltip, title: build.champion, className: "champion-profile-img", 
                            style: {"backgroundImage": "url(/res/autocomplete_mock/" + build.champion + ".png)"}}), 
                            React.createElement("img", {ref: this.useDefaultTooltip, className: "summoner-spell-1-img", title: build.summonerSpells[0].name, src: "/res/spell/" + build.summonerSpells[0].image.full}), 
                            React.createElement("img", {ref: this.useDefaultTooltip, className: "summoner-spell-2-img", title: build.summonerSpells[1].name, src: "/res/spell/" + build.summonerSpells[1].image.full})
                        ), 
                        React.createElement("div", {className: "build-right-col"}, 
                            React.createElement("table", {className: "flex-align-top"}, 
                                React.createElement("tr", null, 
                                    React.createElement("td", null, React.createElement("h4", null, "role")), 
                                    React.createElement("td", null, React.createElement("h3", null, roleName))
                                ), 
                                React.createElement("tr", null, 
                                    React.createElement("td", null, React.createElement("h4", null, "win rate")), 
                                    React.createElement("td", null, React.createElement("h3", null, (build.stats.wins/(build.stats.wins + build.stats.losses) * 100).toFixed(2) + "%" + "(" + build.stats.count + ")"))
                                ), 
                                React.createElement("tr", null, 
                                    React.createElement("td", null, React.createElement("h4", null, "final build"))
                                )
                            ), 
                            React.createElement("div", {className: "final-build"}, 
                                finalBuild
                            )
                        )
                    ), 
                    React.createElement("h4", null, "item build"), 
                    React.createElement("div", {className: "item-build"}, 
                        itemBuild
                    ), 
                    React.createElement("h4", null, "skill order"), 
                    React.createElement("div", {className: "build-bottom"}, 
                        skillOrder
                    ), 
                    React.createElement("a", {onClick: this.handleGetItemSetClick}, "Get ItemSet")
                )
            );
        }
    });

    var RunesAndMasteries = React.createClass({displayName: "RunesAndMasteries",
        useDefaultTooltip:function(component) {
            if (component == undefined) return;
            var $elem = $(component.getDOMNode());
            var title = $elem.attr('title');
            $elem.removeAttr('title');
            $elem.mouseover(function()  {
                tooltip.pop($elem[0], title);
            });
            $elem.click(function()  {
                tooltip.pop($elem[0], title);
            });
        },
        switchView:function(event) {
            var $toAnimate = $(React.findDOMNode(this.refs.root));
            $toAnimate.on("transitionend", function(e)  {
                $toAnimate.off(e);
                this.props.onSwitchView();
            }.bind(this));
            $toAnimate.addClass("dismiss");
        },
        shouldComponentUpdate:function(nextProps, nextState) {
            return !nextProps.ignore;
        },
        setupMastery:function(masteryId, component) {
            if (component === null) return;
            var $elem = $(component.getDOMNode());
            var mastery = this.props.core.masteryData.data[masteryId];

            var doPopup = function()  {
                var text = "<h1>" + mastery.name + "</h1><p>" +
                    mastery.description[0] + "</p>"; 
                tooltip.pop($elem[0], text);
            };

            $elem.mouseover(doPopup);
            $elem.click(doPopup);
        },
        render:function() {
            var build = this.props.build;
            var masteries = build.masteries;
            var masteryData = this.props.core.masteryData;
            var runeData = this.props.core.runeData;

            var masteryView = [];
            if (masteryData != undefined) {
                var masteryTaken = {};
                $.each(masteries, function(index, val)  {
                    masteryTaken[val.masteryId] = val.rank;
                });

                var masteryDic = masteryData.data;
                var generateViewFor = function(treeName, data)  {
                    var t = data;
                    var rowView = t.map(function(val, index)  {
                        var cellView = val.map(function(val, index)  {
                            if (val === null) {
                                return (React.createElement("div", {className: "mastery-cell"}, " "));
                            }

                            var ranks = masteryTaken[val.masteryId];
                            if (ranks === undefined) {
                                ranks = 0;
                            }

                            var imageInfo = masteryDic[val.masteryId].image;
                            var maxRanks = masteryDic[val.masteryId].ranks;
                            var complete = maxRanks === ranks;

                            var bg = ranks === 0 ?
                                "url(/res/gray_" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat" :
                                "url(/res/" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat";

                            return ranks === 0 ? (
                                React.createElement("div", {ref: this.setupMastery.bind(this, val.masteryId), className: "mastery-cell", style: {width: imageInfo.w, height: imageInfo.h, 
                                    background: bg}}
                                )
                            ) : (
                                React.createElement("span", {ref: this.setupMastery.bind(this, val.masteryId)}, 
                                    React.createElement("div", {className: complete ? "mastery-cell-complete" : "mastery-cell-some", 
                                        style: {width: imageInfo.w, height: imageInfo.h, background: bg}}
                                    ), 
                                    React.createElement("div", {className: complete ? "mastery-rank-complete" : "mastery-rank-some"}, 
                                        ranks + "/" + maxRanks
                                    )
                                )
                            );
                        }.bind(this));

                        return (
                            React.createElement("div", {className: "mastery-row"}, 
                                cellView
                            )
                        );
                    }.bind(this));

                    return (
                        React.createElement("div", {className: "mastery-section"}, 
                            rowView
                        )
                    );
                }.bind(this);
                masteryView = $.map(masteryData.tree, function(val, key)  {
                    return generateViewFor(key, val);
                });
            }

            var runeView = [];
            if (runeData !== undefined) {
                runeData = runeData.data;
                runeView = build.runes.map(function(val, index)  {
                    var count = val.rank;
                    var rune = runeData[val.runeId];
                    var imageInfo = rune.image;

                    var bg = "url(/res/" + imageInfo.sprite + ") " + "-" + imageInfo.x + "px -" + imageInfo.y + "px no-repeat";

                    return (
                        React.createElement("div", {className: "runeItem"}, 
                            React.createElement("div", {style: {width: imageInfo.w, height: imageInfo.h, background: bg}}, " "), 
                            React.createElement("p", null, React.createElement("span", {className: "runeName"}, count + "x " + rune.name), React.createElement("span", {className: "runeDesc"}, rune.description))
                        )
                    );
                });
            }


            return (
                React.createElement("div", {className: "runes-masteries themed-light", ref: "root"}, 
                    React.createElement("div", {className: "show-runes-masteries-container"}, 
                        React.createElement("div", {className: "button-show-runes-masteries", onClick: this.switchView}, "Build >"), 
                        React.createElement("div", {className: "fold"})
                    ), 
                    React.createElement("h1", null, "runes & masteries"), 
                    React.createElement("div", {className: "masteries"}, 
                        masteryView
                    ), 
                    React.createElement("div", {className: "runes"}, 
                        runeView
                    )
                )
            );
        }
    });

    return {
        'BuildList': BuildList,
        'Build': Build,
        'RunesAndMasteries': RunesAndMasteries
    }
});