(function() {
    angular.module("vge.controllers", [])
    .controller("appCtrl", ["$scope", function($scope) {
        $scope.showSpinner = false;

        //listen spinner toggles
        $scope.$on("wait", function (evt, val) {
            $scope.showSpinner = val;
        });
    }])
    .controller("loginCtrl", ["$scope", "$location", "vgeService", function($scope, $location, vgeService) {
        if (vgeService.kurve.isLoggedIn())
            $location.path("/visual");
        else {
            // login function for signing user in and redirecting to visual
            $scope.login = function() {
                vgeService.signIn().then(function() {
                    $location.path("/visual");
                }, function (err) {
                    alert(err);
                });
            };
        }
    }])
    .controller("visualCtrl", ["$scope", "$location", "vgeService", function($scope, $location, vgeService) {
        $scope.json = {'name': 'Richard'};
        $scope.typeColors = [
            { type: "me", text: "Me", color: "#e81224", show: true, enabled: false, pic: "/images/01me.png", more: false },
            { type: "groups", text: "Groups", color: "#f7630c", show: false, enabled: true, pic: "/images/02groups.png", more: false },
            { type: "people", text: "People", color: "#ffb900", show: true, enabled: true, pic: "/images/03people.png", more: false },
            { type: "directs", text: "Direct Reports", color: "#fce100", show: false, enabled: true, pic: "/images/04directs.png", more: false },
            { type: "manager", text: "Manager", color: "#bad80a", show: false, enabled: true, pic: "/images/05manager.png", more: false },
            { type: "files", text: "Files", color: "#16c60c", show: false, enabled: true, pic: "/images/06files.png", more: false },
            { type: "trending", text: "Trending", color: "#00b7c3", show: false, enabled: true, pic: "/images/07trending.png", more: false },
            { type: "messages", text: "Messages", color: "#0078d7", show: false, enabled: true, pic: "/images/08messages.png", more: false },
            { type: "events", text: "Events", color: "#4f4bd9", show: false, enabled: true, pic: "/images/09events.png", more: false },
            { type: "contacts", text: "Contacts", color: "#744da9", show: false, enabled: true, pic: "/images/10contacts.png", more: false },
            { type: "notes", text: "Notes", color: "#881798", show: false, enabled: true, pic: "/images/11notes.png", more: false },
            { type: "plans", text: "Plans", color: "#e3008c", show: false, enabled: true, pic: "/images/12plans.png", more: false }
            ///MORE HERE
        ];

        // private function to get color based on the node type
        var getColor = function(type) {
            for (var i = 0; i < $scope.typeColors.length; i++) {
                if ($scope.typeColors[i].type === type)
                    return $scope.typeColors[i].color;
            }
        };

        // private function to set the more flag
        var setMore = function(type, enabled) {
            for (var i = 0; i < $scope.typeColors.length; i++) {
                if ($scope.typeColors[i].type == type) {
                    $scope.typeColors[i].more = enabled;
                    return;
                }
            } 
        };

        // private function that adds nodes from a response
        var addNodes = function (types, result) {
            if (result == null || result.length == 0) {
                // update the visual and stop spinner
                updateVisual(currentData);
                vgeService.wait(false);
                
                console.error('no result');
                return;
            }

            switch (types) {
                case 'groups':
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].name, type: "groups", pic: "/images/02groups.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);

                        // get the photo for the group
                        vgeService.photo(newNode.id, "groups", newNode).then(function(photoResults) {
                            photoResults.node.pic = photoResults.pic;

                            var element = document.getElementById(photoResults.node.code);
                            if (element != null && element.children.length > 0) {
                                element.children[0].setAttribute("href", photoResults.node.pic);
                            }

                            element = document.getElementById(photoResults.node.code + "_c");
                            if (element != null) {
                                element.setAttribute("fill", "url(#" + photoResults.node.code + ")");
                            }
                        });
                    }

                    // update the 'get more' label
                    setMore('groups', vgeService.groupsNextLink != null);
                break;
                case 'people':
                    // TODO:
                break;
                case 'directs': 
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "directs", pic: "/images/04directs.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);

                        // get photo for the user
                        vgeService.photo(result.value[i].id, "users", newNode).then(function(photoResults) {
                            photoResults.node.pic = photoResults.pic;
                            document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                            document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                        });
                    }
                break;
                case 'manager':
                    var newNode = { id: result.id, text: result.displayName, type: "manager", pic: "/images/05manager.png", children: [], hide: false, obj: result };
                    currentData.children.push(newNode);

                    // get photo for the user
                    vgeService.photo(result.id, "users", newNode).then(function(photoResults) {
                        photoResults.node.pic = photoResults.pic;
                        document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                        document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                    });
                break;
                case 'trending':
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "trending", pic: "/images/07trending.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);

                        // get thumbnail if this is a file
                        vgeService.thumbnail(currentData.id, result.value[i].resourceReference.id + "/thumbnails", newNode).then(function(photoResults) {
                            if (photoResults.pic != "") {
                                photoResults.node.pic = photoResults.pic;
                                document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                                document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                            }    
                        });
                    }
                break;
                case 'files':
                    // add the people as children
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].name, type: "files", pic: "/images/06files.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);

                        // get thumbnail if this is a file
                        if (result.value[i].file) {
                            vgeService.thumbnail(currentData.id, "drive/items/" + newNode.id + "/thumbnails", newNode).then(function(photoResults) {
                                photoResults.node.pic = photoResults.pic;
                                document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                                document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                            });
                        }
                    } 

                    // update the 'get more' label
                    setMore('files', vgeService.filesNextLink != null);
                break;
                case 'messages': 
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "messages", pic: "/images/08messages.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);
                    }

                    // update the 'get more' label
                    setMore('messages', vgeService.messagesNextLink != null);
                break;
                case 'events': 
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "events", pic: "/images/09events.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);
                    }

                    // update the 'get more' label
                    setMore('events', vgeService.eventsNextLink != null);
                break;
                case 'contacts':
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "contacts", pic: "/images/10contacts.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);
                    }

                    // update the 'get more' label
                    setMore('contacts', vgeService.contactsNextLink != null);
                break;
                case 'notes':
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = { id: result.value[i].id, text: result.value[i].displayName, type: "notes", pic: "/images/11notes.png", children: [], hide: false, obj: result.value[i] };
                        currentData.children.push(newNode);
                    }

                    // update the 'get more' label
                    setMore('notes', vgeService.notesNextLink != null);
                break;
            }

            // update the visual and stop spinner
            updateVisual(currentData);
            vgeService.wait(false);
        }

        // toggle the menu
        $scope.showDetails = true;
        $scope.showFilters = false;
        $scope.toggleMenu = function(option) {
            $scope.showDetails = (option == "details");
            $scope.showFilters = (option == "filters");
        };

        // ensure the user is signed in
        if (!vgeService.kurve.isLoggedIn())
            $location.path("/login");
        else {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var force, visual, link, node, currentData, nodes;

            // gets cache code to prevent node cache
            var getCacheCode = function () {
                var range = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                var id = '';
                for (i = 0; i < 8; i++)
                    id += range[parseInt(Math.random() * 36)];
                return id;
            };

            // updateVisual function for refreshing the d3 visual
            var updateVisual = function(data) {
                // computes children accordingly (discarding the hidden ones)
                function computeChildren(p) {
                    var children = [];
                    for (var i = 0; p.children && i < p.children.length; i++) {
                        if (p.children[i].hide) {
                            continue;
                        }
                        children.push(p.children[i]);
                    }
                    return children;
                }

                // computes links
                function computeLinks(nodes) {
                    return d3.merge(nodes.map(function(parent) {
                        return computeChildren(parent).map(function(child) {
                            return {source: parent, target: child};
                        });
                    }));
                }
        
                //prepare the data and restart the force
                data.fixed = true;
                data.x = width / 2;
                data.px = width / 2;
                data.y = height / 2;
                data.py = height / 2;
                data.radius = 30;
                currentData = data;
                nodes = flatten(data);
                var links = computeLinks(nodes);
        
                //restart the force layout and update the links
                force.linkDistance(function(d, i) {
                    //TODO: don't reset this if already set
                    var maxRadius = (((width >= height) ? height : width) / 2.5)
                    return Math.random() * maxRadius + (maxRadius * 0.3);
                }).size([width, height]);

                force.nodes(nodes).links(links).start();
                link = visual.selectAll('line.link').data(links, function(d) {
                    return d.target.id;
                });
        
                //enter new links and remove old links
                link.enter().insert('line', '.node')
                    .attr('class', 'link')
                    .attr('stroke', function(d) { return getColor(d.target.type); })
                    .attr('stroke-width', '2px')
                    .attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });
                link.exit().remove();
        
                //update the nodes
                node = visual.selectAll('.node')
                    .data(nodes, function(d) {  return d.id; });
                patterns = visual.selectAll('.imgPattern')
                    .data(nodes, function(d) {  return d.id; });
            
                //add dynamic patterns for photos and remove old
                patterns.enter().append('pattern')
                    .attr('id', function(d) { return d.code; })
                    .attr('class', 'imgPattern')
                    .attr('height', function(d) { return d.radius * 2; })
                    .attr('width', function(d) { return d.radius * 2; })
                    .attr('x', '0')
                    .attr('y', '0').append('image')
                    .attr('height', function(d) { return d.radius * 2; })
                    .attr('width', function(d) { return d.radius * 2; })
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('xlink:href', function (d) { return d.pic; });
                patterns.exit().remove();
            
                //add the nodes
                node.enter().append('circle')
                    .attr('id', function(d) { return d.code + '_c'; })
                    .attr('fill', function(d) { return (d.pic != '') ? 'url(#' + d.code + ')' : getColor(d.type); })
                    .attr('r', function(d) { return d.radius; })
                    .attr('stroke', function(d) { return getColor(d.type); })
                    .attr('stroke-width', '2px')
                    .style('cursor', 'default')
                    .attr('class', 'node')
                    .on('click', function (d) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: handle click event
                    })
                    .on('mouseover', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: show tooltip
                        $scope.json = d.obj;
                        $scope.$apply();
                    })
                    .on('mousemove', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: move tooltop
                    })
                    .on('mouseout', function (d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: hide tooltip
                    })
                    .call(force.drag);
        
                //exit old nodes
                node.exit().remove();
            };

            var setRadius = function(data, r) {
                for (var i = 0; i < data.children.length; i++) {
                    data.children[i].radius = r;
                    setRadius(data.children[i], r);
                }
            }

            //returns a list of all child nodes under the spotlight
            var flatten = function(data) {
                var nodes = [], i = 0;

                function recurse(node) {
                    if (!node.radius)
                        node.radius = 20;
                    if (!node.code)
                        node.code = getCacheCode();
                    if (node.children) 
                        node.size = node.children.reduce(function(p, v) {return p + recurse(v); }, 0);
                    if (!node.id) 
                        node.id = ++i;
                    if (!node.hide)
                        nodes.push(node);
                    return node.size;
                }

                data.size = recurse(data);
                return nodes;
            };

            // function for d3 collide
            var collide = function(node) {
                var r = node.radius + 16,
                    nx1 = node.x - r,
                    nx2 = node.x + r,
                    ny1 = node.y - r,
                    ny2 = node.y + r;
                return function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== node)) {
                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = node.radius + quad.point.radius;
                        if (l < r) {
                            l = (l - r) / l * .5;
                            node.x -= x *= l;
                            node.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                };
            };

            // tick
            var tick = function(e) {
                var q = d3.geom.quadtree(nodes), i = 0, n = nodes.length;
                while (++i < n) {
                    q.visit(collide(nodes[i]));
                }

                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });
        
                visual.selectAll("circle")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            };

            // initialize force
            force = d3.layout.force()
                .on('tick', tick)
                .charge(function(d) {
                    return d._children ? -d.size / 100 : -30;
                });
                
            // initialize the d3 objects for force
            visual = d3.select('#divCanvas').append('svg')
                .attr('width', width)
                .attr('height', height);

            // resize visual and force
            visual.attr('width', width).attr('height', height);
            force.size([width, height]);

            // initialize visual using the graph getting ME
            vgeService.wait(true);
            currentData = {};
            vgeService.me().then(function(meResults) {
                currentData = { id: meResults.id, text: meResults.displayName, type: "me", pic: "/images/01me.png", children: [], code: getCacheCode(), loadStatus: { people: true }, hide: false, obj: meResults };

                // next get people
                vgeService.people(meResults.id).then(function(peopleResults) {
                    // add the people as children of root
                    for (var i = 0; i < peopleResults.value.length; i++) {
                        var newNode = { id: peopleResults.value[i].id, text: peopleResults.value[i].displayName, type: "people", pic: "/images/03people.png", children: [], hide: false, obj: peopleResults.value[i] };
                        currentData.children.push(newNode);

                        // get photo for the user
                        vgeService.photo(peopleResults.value[i].id, "users", newNode).then(function(photoResults) {
                            photoResults.node.pic = photoResults.pic;
                            document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                            document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                        });
                    }
                    
                    // update the visual and stop spinner
                    updateVisual(currentData);
                    vgeService.wait(false);

                    // get the photo for me
                    vgeService.photo(meResults.id, "users", currentData).then(function(photoResults) {
                        photoResults.node.pic = photoResults.pic;
                        document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                        document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                    });
                });
            });

            $scope.toggleMore = function(filterItem) {
                // start the spinner
                vgeService.wait(true);

                switch (filterItem.type) {
                    case 'groups': 
                        // query for groups
                        vgeService.nextGroup().then(function(groupResult) {
                            addNodes('groups', groupResult);
                        });
                    break;
                    case 'files': 
                        // query for files
                        vgeService.nextFiles().then(function(fileResult) {
                            addNodes('files', fileResult);
                        });
                    break;
                    case 'messages': 
                        // query for messages
                        vgeService.nextMessages().then(function(messageResult) {
                            addNodes('messages', messageResult);
                        });
                    break;
                    case 'events': 
                        // query for events
                        vgeService.nextEvents().then(function(eventResult) {
                            addNodes('events', eventResult);
                        });
                    break;
                    case 'contacts': 
                        // query for contacts
                        vgeService.nextContacts().then(function(contactResult) {
                            addNodes('contacts', contactResult);
                        });
                    break;
                    case 'notes': 
                        // query for notes
                        vgeService.nextNotes().then(function(noteResult) {
                            addNodes('notes', noteResult);
                        });
                    break;
                }
            };

            // toggles
            $scope.toggleFilter = function(filterItem) {
                // start the spinner
                vgeService.wait(true);

                // check which way to toggle the display
                if (!filterItem.show) {
                    // this type is already loaded but we want to hide them now
                    for (var i = 0; i < currentData.children.length; i++) {
                        if (currentData.children[i].type == filterItem.type)
                            currentData.children[i].hide = true;
                    }

                    // update the 'get more' label
                    setMore(filterItem.type, false);

                    // update the visual and stop spinner
                    updateVisual(currentData);
                    vgeService.wait(false);
                }
                else {
                    // first check to see if loaded
                    if (currentData.loadStatus[filterItem.type]) {
                        // already loaded...loop through and toggle to show
                        for (var i = 0; i < currentData.children.length; i++) {
                            if (currentData.children[i].type == filterItem.type)
                                currentData.children[i].hide = false;
                        }

                        // update the visual and stop spinner
                        updateVisual(currentData);
                        vgeService.wait(false);
                    }
                    else {
                        // need to load and then mark loaded
                        switch (filterItem.type) {
                            case "groups":
                                // query for files
                                vgeService.groups(currentData.id).then(function(groupResults) {
                                    addNodes('groups', groupResults);
                                });
                                break;
                            case "people":
                                // TODO:
                                // query for people
                                //addNodes('people', peopleResult);
                                break;
                            case "directs":
                                // query for directs
                                vgeService.directs(currentData.id).then(function(directResult) {
                                    addNodes('directs', directResult);
                                });
                                break;
                            case "manager":
                                // query for manager
                                vgeService.manager(currentData.id).then(function(managerResult) {
                                    addNodes('manager', managerResult);
                                });
                                break;
                            case "files":
                                // query for files
                                vgeService.files(currentData.id).then(function(fileResults) {
                                    addNodes('files', fileResults);
                                });
                                break;
                            case "trending":
                                // query for trending
                                vgeService.trending(currentData.id).then(function(trendingResult) {
                                    addNodes('trending', trendingResult);
                                });
                                break;
                            case "messages":
                                // query for messages
                                vgeService.messages(currentData.id).then(function(messageResult) {
                                    addNodes('messages', messageResult);
                                });
                                break;
                            case "events":
                                // query for events
                                vgeService.events(currentData.id).then(function(eventResult) {
                                    addNodes('events', eventResult);
                                });
                                break;
                            case "contacts":
                                // query for contacts
                                vgeService.contacts(currentData.id).then(function(contactResult) {
                                    addNodes('contacts', contactResult);
                                });
                                break;
                            case "notes":
                                // query for notes
                                vgeService.notes(currentData.id).then(function(noteResult) {
                                    addNodes('notes', noteResult);
                                });
                                break;
                            case "plans":
                                // TODO:
                                // query for plans
                                //addNodes('plans', planResult);
                                break;
                        }
                    }
                }
            };
        }
    }]);
})();