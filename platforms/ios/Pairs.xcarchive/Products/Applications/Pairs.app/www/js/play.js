/* global game, _, Phaser, Tile */
var pairs = pairs || {};

pairs.playState = {
    create: function() {

        this.windowWidth = 360;
        this.windowHeight = 480;
        this.revealSpeed = 250; // speed to show/hide in ms

        this.boxSize = 60;
        this.gapSize = 10;

        this.boardWidth = 4;
        this.boardHeight = 6;

        game.global.totalMoves = 0;

        this.deadAlpha = 0.4;

        this.xMargin = (this.windowWidth - (this.boardWidth * (this.boxSize + this.gapSize))) / 2;
        this.yMargin = (this.windowHeight - (this.boardHeight * (this.boxSize + this.gapSize))) / 2;

        // 15 particles
        this.emitter = game.add.emitter(0, 0, 15);
        // set particle image
        this.emitter.makeParticles('pixel');
        // speed in range -150 and 150
        this.emitter.setYSpeed(-150, 150);
        this.emitter.setXSpeed(-150, 150);
        this.emitter.gravity = 0;

        this.secondEmitter = game.add.emitter(0, 0, 15);
        this.secondEmitter.makeParticles('pixel');
        this.secondEmitter.setYSpeed(-150, 150);
        this.secondEmitter.setXSpeed(-170, 170);
        this.secondEmitter.gravity = 0;

        this.star = 'star';
        this.rings = 'rings';
        this.hex = 'hex';
        this.square = 'square';
        this.diamond = 'diamond';
        this.circle = 'circle';
        // this.lines = 'lines';
        this.triangle = 'triangle';

        // shape colours
        // this.fire = Phaser.Color.createColor(214,147,92); // then call Phaser.Color.getColor(self.darkGrey.r, self.darkGrey.g, self.darkGrey.b)
        this.navyBlue = Phaser.Color.createColor(60, 60, 100);
        this.brown = Phaser.Color.createColor(185,138,122);
        // this.lilac = Phaser.Color.createColor(170,173,204);
        // this.life = Phaser.Color.createColor(217,200,182);
        this.purple = Phaser.Color.createColor(138,76,124);
        // this.grey = Phaser.Color.createColor(109,127,142);
        this.russet = Phaser.Color.createColor(174,70,0);
        // this.orange = Phaser.Color.createColor(222,73,30);
        this.amber = Phaser.Color.createColor(255,149,22);
        this.pink = Phaser.Color.createColor(244,160,170);
        this.chocolate = Phaser.Color.createColor(89,31,0);
        
        // ui colours
        this.white = Phaser.Color.createColor(255, 255, 255);
        this.darkGrey = Phaser.Color.createColor(74,72,73);
        this.peach = Phaser.Color.createColor(242,216,179);

        this.allColours = [this.chocolate, this.brown, this.purple, this.russet, this.amber, this.pink, this.navyBlue];
        this.allShapes = [this.star, this.rings, this.hex, this.square, this.diamond, this.circle, this.triangle];

        this.boxColour = this.darkGrey;
        this.backgroundColour = this.peach;

        game.stage.backgroundColor = Phaser.Color.getColor(this.backgroundColour.r, this.backgroundColour.g, this.backgroundColour.b);

        this.board = this.getRandomisedBoard();

        // used to find box positions
        this.tiles = _.flatten(this.board);

        this.firstSelected = '';
        this.secondSelected = '';
        this.totalRevealed = 0;

        this.animating = false;

        game.input.onDown.add(this.boxClick);

        this.playGame();
    },

    playGame: function() {
        this.drawBoard(this.board, this.revealed);
        game.time.events.add(1000, function() {
            this.coverBoxesAnimation(_.flatten(this.board));
        }, this);
    },

    pickColour: function() {
        return this.allColours[Math.floor(Math.random() * this.allColours.length)];
    },

    getRandomisedBoard: function() {
        // create coloured icons for half the tiles
        var maxIcons = (this.boardWidth * this.boardHeight) / 2;
        var icons = [];

        var usedColours = [];

        for(var i = 0; i < maxIcons; i++) {
            // pick random colour
            var colour = this.pickColour();

            while(_.indexOf(usedColours, colour) > -1) {
                colour = this.pickColour();
            }
            var shape = this.allShapes[Math.floor(Math.random() * this.allShapes.length)];

            usedColours.push(colour);
            if(usedColours.length === this.allColours.length) {
                usedColours = [];
            }

            icons.push([shape, colour]);
        }

        // double the icon array so there's two of each
        icons = icons.concat(icons);
        icons = _.shuffle(icons);

        var board = [];
        for(var x = 0; x < this.boardWidth; x++) {
            var col = [];
            for(var y = 0; y < this.boardHeight; y++) {
                var icon = icons.pop();
                var tile = new Tile();
                tile.x = x;
                tile.y = y;
                tile.shape = icon[0];
                tile.colour = icon[1];
                tile.id = x + y;

                col.push(tile);
            }
            board.push(col);
        }

        return board;
    },

    drawBoard: function(board) {
        var self = pairs.playState;

        _.each(_.flatten(board), function(tile) {
            var coords = self.boxCoordsInPixels(tile.x, tile.y);

            tile.sprite = game.add.sprite(coords.x, coords.y, tile.shape);
            tile.sprite.tint = Phaser.Color.getColor(tile.colour.r, tile.colour.g, tile.colour.b);

            tile.box = game.add.sprite(coords.x, coords.y, 'box');
            tile.box.tint = Phaser.Color.getColor(self.darkGrey.r, self.darkGrey.g, self.darkGrey.b);
            tile.box.width = 0;
            tile.box.inputEnabled = true;
        });

      
    },

    /**
    * convert tile coords to pixel screen value
    */
    boxCoordsInPixels: function(x, y) {
        return {
            x: x * (this.boxSize + this.gapSize) + this.xMargin,
            y: y * (this.boxSize + this.gapSize) + this.yMargin
        };
    },

    getShapeAndColour: function(board, x, y) {
        return {
            shape: board[x][y][0],
            colour: board[x][y][1]
        };
    },

    /**
    * Convert pixel coords into the box at that position
    */
    getBoxAtPos: function(x, y) {
        var self = pairs.playState;

        return _.find(self.tiles, function(tile) {

            var pos = self.boxCoordsInPixels(tile.x, tile.y);
            var collisionRect = new Phaser.Rectangle(pos.x, pos.y, self.boxSize, self.boxSize);

            if(collisionRect.contains(x, y)) {
                return tile;
            }

            return false;
        });
    },

    boxClick: function() {
        var self = pairs.playState;
        if(!self.animating) {

            var tile = self.getBoxAtPos(game.input.x, game.input.y);

            if(tile) {
                if(!tile.revealed) {
                    self.game.add.tween(tile.box).to({width: 0}, self.revealSpeed).start();

                    // update total moves
                    game.global.totalMoves += 1;

                    if(self.firstSelected === '') {
                        self.firstSelected = tile;

                    } else if(self.secondSelected === '') {
                        self.secondSelected = tile;
                        self.animating = true;

                        // compare two icons
                        if((self.firstSelected.shape === self.secondSelected.shape) && (self.firstSelected.colour === self.secondSelected.colour)) {
                            self.tileMatched();

                            self.totalRevealed += 2;
                            if(self.totalRevealed === self.tiles.length) {
                                // game over!
                                self.win();
                            }
                            
                        } else {
                            // cover boxes
                            game.time.events.add(800, function() {
                                self.coverBoxesAnimation([self.firstSelected, self.secondSelected]);
                                self.firstSelected = '';
                                self.secondSelected = '';
                                self.animating = false;
                            });
                        } // end selectedTile check
                        
                    }
                    tile.revealed = true;
                    
                } // end !tile.revealed

            }
        }
        
    },


    // // boxes = array of boxes to cover over
    coverBoxesAnimation: function(tiles) {
        var self = pairs.playState;

        _.each(tiles, function(tile) {
            var delay = (100 * tile.x) + (50 * tile.y);

            // to({properties}, duration, easing, autostart, delay)
            this.game.add.tween(tile.box).to({width: self.boxSize}, self.revealSpeed, Phaser.Easing.Default, true, delay);
            tile.revealed = false;
        });
    },

    win: function() {
        var self = this;

        // centre, width, height
        this.finalEmitter = game.add.emitter(0, 0, 0);
        this.finalEmitter.width = game.world.width / 2;
        this.finalEmitter.makeParticles('pixel');
        this.finalEmitter.setYSpeed(-80, 80);
        this.finalEmitter.setXSpeed(-80, 80);
        this.finalEmitter.gravity = 10;
        this.finalEmitter.x = game.world.centerX;
        this.finalEmitter.y = 0;
        this.finalEmitter.forEach(function(particle) {
            particle.tint = Phaser.Color.getColor(self.amber.r, self.amber.g, self.amber.b);
        });

        // explode, lifespan, frequency, quantity
        this.finalEmitter.start(false, 5000, 20);

        // if high score not yet set
        if(parseInt(localStorage.getItem('highScore'), 10) === 0) {
            localStorage.setItem('highScore', game.global.totalMoves);
        }

        if(game.global.totalMoves < parseInt(localStorage.getItem('highScore'), 10)) {
            localStorage.setItem('highScore', game.global.totalMoves);
        }


        var winLabel = game.add.text(
            game.world.centerX,
            game.world.centerY - 80,
            'You win!',
            {
                font: '40px Merriweather',
                fill: '#372409',
                align: 'center'
            }
        );
        winLabel.anchor.setTo(0.5, 0.5);

        var moveLabel = game.add.text(
            game.world.centerX,
            game.world.centerY - 20,
            'Total moves: ' + game.global.totalMoves,
            {
                font: '20px Merriweather',
                fill: '#372409',
                align: 'center'
            }
        );
        moveLabel.anchor.setTo(0.5, 0.5);

        var highScoreLabel = game.add.text(
            game.world.centerX,
            game.world.centerY + 20,
            'Best score: ' + localStorage.getItem('highScore'),
            {
                font: '20px Merriweather',
                fill: '#372409',
                align: 'center'
            }
        );
        highScoreLabel.anchor.setTo(0.5, 0.5);

        var playLink = game.add.button(
            game.world.centerX,
            game.world.centerY + 100,
            'play',
            this.replay,
            this,
            1,
            0
        );
        playLink.anchor.setTo(0.5, 0.5);
        game.add.tween(playLink.scale).to({ x: 1.2, y: 1.2 }, 300).to({ x: 1, y: 1 }, 300).delay(1500).loop().start();

        var creditsLink = game.add.button(
            game.world.centerX,
            game.world.centerY + 180,
            'credits',
            pairs.credits,
            this,
            1,
            0
        );
        creditsLink.anchor.setTo(0.5, 0.5);
    },

    replay: function() {
        game.state.start('play');
    },

    tileMatched: function() {
        var self = this;

        self.firstSelected.sprite.anchor.setTo(0.4, 0.5);
        self.firstSelected.sprite.x = self.firstSelected.sprite.x + (self.boxSize * 0.4);
        self.firstSelected.sprite.y = self.firstSelected.sprite.y + (self.boxSize / 2);

        self.secondSelected.sprite.anchor.setTo(0.6, 0.5);
        self.secondSelected.sprite.x = self.secondSelected.sprite.x + (self.boxSize * 0.6);
        self.secondSelected.sprite.y = self.secondSelected.sprite.y + (self.boxSize / 2);

        // animate first sprite
        game.add.tween(self.firstSelected.sprite).to({ alpha: self.deadAlpha, angle: 360 }, 300).start();
        game.add.tween(self.firstSelected.sprite.scale).to({ x: 0.8, y: 0.8 }, 300).start();

        game.add.tween(self.secondSelected.sprite).to({ alpha: self.deadAlpha, angle: -360 }, 300).start();
        game.add.tween(self.secondSelected.sprite.scale).to({ x: 0.8, y: 0.8 }, 300).start();

        self.emitter.x = self.firstSelected.sprite.x;
        self.emitter.y = self.firstSelected.sprite.y;
        self.emitter.forEach(function(particle) {
            particle.tint = Phaser.Color.getColor(self.firstSelected.colour.r, self.firstSelected.colour.g, self.firstSelected.colour.b);
        });

        // 15 particles which live for 350ms
        self.emitter.start(true, 350, null, 15);

        self.secondEmitter.x = self.secondSelected.sprite.x;
        self.secondEmitter.y = self.secondSelected.sprite.y;
        
        self.secondEmitter.forEach(function(particle) {
            particle.tint = Phaser.Color.getColor(self.secondSelected.colour.r, self.secondSelected.colour.g, self.secondSelected.colour.b);
        });
        // explode, lifespan, frequency, quantity
        self.secondEmitter.start(true, 450, null, 15);

        // reset
        self.firstSelected = '';
        self.secondSelected = '';
        self.animating = false;
    }
};


