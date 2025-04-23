// Create ou only scene called mainScene
class mainScene {
    //the 3 methods currentle empty

    preload() {
        // this method is called once at the beginning
        // It will load all the assets, like sprites and sounds
        // Parameters: name of the sprite, path of the image
        this.load.image('ghost', 'assets/ghost.png'); // ghost
        this.load.image('apple', 'assets/apple.png'); // apple
        this.load.image('spik', 'assets/spike.png'); // spike
        this.load.image('heart', 'assets/heart.png'); // vidas
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

        // Criar grupo de spikes e vidas
        this.spikes = this.physics.add.group();
        this.hearts = this.physics.add.group();

        // colisão
        this.physics.add.overlap(this.player, this.spikes, this.hurt, null, this); // spike
        this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this); // vidas

        // Cria invencibilidade
        this.invincible = false;

        // Mecanica de vidas
        this.lives = 3;
        this.maxLives = 5;
        this.lifeIcons = [];

        for(let i = 0; i < this.lives; i++) {
            let icon = this.add.image(30 + i * 20, 60, 'heart');
            icon.setScale(0.5);
            this.lifeIcons.push(icon);
        }

        // Exibir leaderboar
        this.showLeaderboard();

    };

    update() {
        // This method is called 60 times per secon after create()
        // It will handle all the game's logic, like movements
        
        // If the player is overlapping with the coin
        if (this.physics.overlap(this.player, this.coin)) {
            // call the new hit() method
            this.hit();
        }
        // if (this.physics.overlap(this.player, this.spik)) {
        //     // call the new spike() method
        //     this.hurt();
        // }


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

        // Loop horizontal e vertical (boneco não sai da tela)
        // horizontal
        if (this.player.x > 700) {
            this.player.x = 0;
        } else if (this.player.x < 0) {
            this.player.x = 700;
        }
        // vertical
        if (this.player.y > 400) {
            this.player.y = 0;
        } else if (this.player.y < 0) {
            this.player.y = 400;
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

        // 1% de chance de criar um coração
        if (Phaser.Math.Between(1, 5) === 1) {
            const heart = this.hearts.create(
                Phaser.Math.Between(100,600),
                Phaser.Math.Between(100,300),
                'heart'
            );
            heart.setScale(0.5);

            this.tweens.add({
                targets: heart,
                scale: { from: 0.5, to: 0.6 },
                duration: 150,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    hurt(player, spike) {
    //    // change the position x and y of the coin randomly
    //    this.spik.x = Phaser.Math.Between(100, 600);
    //    this.spik.y = Phaser.Math.Between(100, 300);
        // Verifica a invencibilidade
        if (this.invincible) return; // Se estiver invencível, então ignora o hit

        this.invincible = true; // como vc tomou hit, ativa a invencibilidade

        // Diminui Score e Vida ao levar hit
        this.score -= 5;
        if(this.score < 0) { this.score = 0 };
        let prev = this.lives;
        this.lives -= 1;
        if(this.lives <= 0) { // encerra o jogo se a vida chegar a 0
            let playerName = prompt("GAME OVER!\nDigite seu nome para o leaderboard:");
            if(!playerName) playerName = 'Sem nome';
            this.saveScore(playerName, this.score); // salva o score e player
            this.scene.restart(); // reseta o jogo
        }
        this.updateLifeIcons(prev);

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

        // Depois de 1s, remove a invencibilidade
        this.time.delayedCall(500, () => {
            this.invincible = false;
        });
    }

    collectHeart(player, heart) {
        heart.destroy(); 

        if(this.lives < this.maxLives) {
            let prev = this.lives;
            this.lives += 1;
            this.updateLifeIcons(prev);
        }
    }

    updateLifeIcons(previousLives = this.lifeIcons.length) {
        // remove todos os ícones visuais
        this.lifeIcons.forEach(icon => icon.destroy());
        this.lifeIcons = [];

        // adiciona conforme a quantidade de vidas atual
        for(let i =0; i < this.lives; i++) {
            let icon = this.add.image(30 + i * 20, 60, 'heart');
            icon.setScale(0.5);
            this.lifeIcons.push(icon);

            // Se ganhou vida (ícones novos)
            if (i >= previousLives) {
                this.animateLifeGain(icon);
            }
        }

        // Se perdeu vida (mostra animação no último ícone anterior)
        if (previousLives > this.lives) {
            let lostIndex = this.lives; // o próximo após os atuais
            let tempIcon = this.add.image(30 + lostIndex * 20, 60, 'heart');
            tempIcon.setScale(0.5);
            this.animateLifeLost(tempIcon);
            this.time.delayedCall(500, () => tempIcon.destroy());
        }
    }

    animateLifeLost(icon) {
        this.tweens.add({
            targets: icon,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                icon.alpha = 1;
            }
        });
    }

    animateLifeGain(icon) {
        this.tweens.add({
            targets: icon,
            scale: 0.6,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                icon.setScale(0.5);
            }
        });
    }

    // Leaderboard
    saveScore(name, score) { // SAVE
        let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        scores.push({ name, score });
        scores.sort((a, b) => b.score - a.score); // ordena do maior pro menor
        scores = scores.slice(0, 5); // mantém só os 5 maiores
        localStorage.setItem('leaderboard', JSON.stringify(scores));
    }

    showLeaderboard() { // SHOW
        let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        const leaderboardEl = document.getElementById('leaderboard');
        if (!leaderboardEl) return;

        leaderboardEl.innerHTML = ''; // limpa antes de atualizar

        scores.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardEl.appendChild(li);
    });
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