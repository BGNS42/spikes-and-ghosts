// Create ou only scene called mainScene
class mainScene {
    //the 3 methods currentle empty

    preload() {
        // this method is called once at the beginning
        // It will load all the assets, like sprites and sounds
        // Parameters: name of the sprite, path of the image
        this.load.image('ghost', 'assets/ghost.png');
        this.load.image('apple', 'assets/apple.png');
        this.load.image('spik', 'assets/spike.png');
    };

    create() {
        // This method is calle onde, just after preload()
        // It will initialize our scene, like the position of the sprites
        // Parameters: x position, y position, name of the sprite
        this.player = this.physics.add.sprite(100, 100, 'ghost');
        this.coin = this.physics.add.sprite(300, 300, 'apple');
        

        // store the score in a variable, initialized at 0
        this.score = 0;

        // The style of the text
        // A lot of options are available, these are the most important ones
        let style = { font: '20px Arial', fill: '#fff' };

        // Display the score in the top left corner
        // parameters: x position, y position, text, style
        this.scoreText = this.add.text(20, 20, 'score: ' + this.score, style);

        // To tell Phaser to use the keys input
        this.arrow = this.input.keyboard.createCursorKeys();

        // Criar grupo de spikes
        this.spikes = this.physics.add.group();
        // Detectar colisão com spike
        this.physics.add.overlap(this.player, this.spikes, this.hurt, null, this);
    };

    update() {
        // This method is called 60 times per secon after create()
        // It will handle all the game's logic, like movements
        
        // If the player is overlapping with the coin
        if (this.physics.overlap(this.player, this.coin)) {
            // call the new hit() method
            this.hit();
        }
        if (this.physics.overlap(this.player, this.spik)) {
            // call the new spike() method
            this.hurt();
        }


        // Handle horizontal movements
        if (this.arrow.right.isDown) {
            // If the right arrow is pressed, move to the right
            this.player.x += 3;
        } else if (this.arrow.left.isDown) {
            // If the left arrow is pressed, move to the left
            this.player.x -= 3;
        }

        // Handle vertical movements
        if (this.arrow.down.isDown) {
            // If the down arrow is pressed, move down
            this.player.y += 3;
        } else if (this.arrow.up.isDown) {
            // If the down arrow is pressed, move down
            this.player.y -= 3;
        }
    };

    // Collisions
    hit () {
        // change the position x and y of the coin randomly
        this.coin.x = Phaser.Math.Between(100, 600);
        this.coin.y = Phaser.Math.Between(100, 300);

        // Increment the score by 10
        this.score += 10;

        // Display the updated score on the screen
        this.scoreText.setText('score: ' + this.score);

        // new tween
        this.tweens.add({
            targets: this.player, // on the player
            duration: 120, // fos 200ms
            scaleX: 1.2, // that scale vertically by 20%
            scaleY: 1.2, // that scale horizontally by 20%
            yoyo: true, // at the end, go back to original scale
        });

        // Create a spike
        const spike = this.spikes.create(
            Phaser.Math.Between(100, 600),
            Phaser.Math.Between(100, 300),
            'spik'
        );
    }

    hurt(player, spike) {
    //    // change the position x and y of the coin randomly
    //    this.spik.x = Phaser.Math.Between(100, 600);
    //    this.spik.y = Phaser.Math.Between(100, 300);
       
        // Decrement the score by 20
        this.score -= 20;
        if(this.score < 0) { this.score = 0 };

        // Display the updated score on the screen
        this.scoreText.setText('score: ' + this.score);

        // hurt tween
        this.tweens.add({
            targets: player, // on the player
            alpha: 0,
            duration: 100, // fos 200ms
            yoyo: true, // at the end, go back to original scale
            repeat: 2,
            onComplete: () => {
                player.alpha = 1; // garante que volte ao normal
            }
        });
        // remove a spike que encostou da tela
        spike.destroy();
    }
}




// Start the game
new Phaser.Game ({
    width: 700, // width of the game in pixels
    height: 400, // heigth of the game in pixels
    backgroundColor: '#3498DB', // the backgroundcolor (blue)
    scene: mainScene, // The name of the snece we created
    physics: { default: 'arcade' }, // The physics engine to use
    parent: 'game', // create the game inside the <div id="game">
});