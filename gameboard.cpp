#include "gameboard.h"
#include "ui_gameboard.h"
#include <QMessageBox>

GameBoard::GameBoard(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::GameBoard),
    isVsComputer(false)
{
    ui->setupUi(this);

    setupButtons();

    // Connect all cell buttons
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            connect(buttons[i][j], &QPushButton::clicked,
                    this, &GameBoard::onCellClicked);
        }
    }

    // Connect control buttons
    connect(ui->btnReset, &QPushButton::clicked,
            this, &GameBoard::onResetClicked);
    connect(ui->btnMainMenu, &QPushButton::clicked,
            this, &GameBoard::onMainMenuClicked);

    updateStatus();
}

GameBoard::~GameBoard()
{
    delete ui;
}

void GameBoard::setGameMode(bool isPlayerVsComputer)
{
    isVsComputer = isPlayerVsComputer;
    gameLogic.initializeBoard();
    updateBoard();
    updateStatus();
}

void GameBoard::setupButtons()
{
    // Store pointers to all 9 buttons in our 2D array
    buttons[0][0] = ui->btn_0_0;
    buttons[0][1] = ui->btn_0_1;
    buttons[0][2] = ui->btn_0_2;
    buttons[1][0] = ui->btn_1_0;
    buttons[1][1] = ui->btn_1_1;
    buttons[1][2] = ui->btn_1_2;
    buttons[2][0] = ui->btn_2_0;
    buttons[2][1] = ui->btn_2_1;
    buttons[2][2] = ui->btn_2_2;
}

void GameBoard::onCellClicked()
{
    // Find which button was clicked
    QPushButton* clickedButton = qobject_cast<QPushButton*>(sender());

    // Find its position in our array
    int row = -1, col = -1;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (buttons[i][j] == clickedButton) {
                row = i;
                col = j;
                break;
            }
        }
        if (row != -1) break;
    }

    // Try to make the move
    char currentPlayer = gameLogic.getCurrentPlayer();
    if (gameLogic.makeMove(row, col, currentPlayer)) {
        // Move was successful
        updateBoard();

        // Check if game is over
        char winner = gameLogic.checkWinner();
        if (winner != 'N') {
            handleGameOver();
            return;
        }

        // Switch player
        gameLogic.switchPlayer();
        updateStatus();

        // If vs computer and now it's O's turn, make computer move
        if (isVsComputer && gameLogic.getCurrentPlayer() == 'O') {
            gameLogic.makeComputerMove();
            updateBoard();

            // Check if computer won
            winner = gameLogic.checkWinner();
            if (winner != 'N') {
                handleGameOver();
                return;
            }

            // Switch back to player
            gameLogic.switchPlayer();
            updateStatus();
        }
    }
}

void GameBoard::updateBoard()
{
    // Update all button labels based on game state
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            char value = gameLogic.getCellValue(i, j);
            if (value == ' ') {
                buttons[i][j]->setText("");
                buttons[i][j]->setEnabled(true);
            } else {
                buttons[i][j]->setText(QString(value));
                buttons[i][j]->setEnabled(false);
            }
        }
    }
}

void GameBoard::updateStatus()
{
    char currentPlayer = gameLogic.getCurrentPlayer();
    if (currentPlayer == 'X') {
        ui->statusLabel->setText("Player X's Turn");
    } else {
        if (isVsComputer) {
            ui->statusLabel->setText("Computer's Turn (O)");
        } else {
            ui->statusLabel->setText("Player O's Turn");
        }
    }
}

void GameBoard::handleGameOver()
{
    char winner = gameLogic.checkWinner();

    QString message;
    if (winner == 'X') {
        message = "Player X Wins!";
        ui->statusLabel->setText("Game Over - X Wins!");
    } else if (winner == 'O') {
        if (isVsComputer) {
            message = "Computer Wins!";
            ui->statusLabel->setText("Game Over - Computer Wins!");
        } else {
            message = "Player O Wins!";
            ui->statusLabel->setText("Game Over - O Wins!");
        }
    } else if (winner == 'D') {
        message = "It's a Draw!";
        ui->statusLabel->setText("Game Over - Draw!");
    }

    disableAllButtons();

    // Show message box
    QMessageBox::information(this, "Game Over", message);
}

void GameBoard::disableAllButtons()
{
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            buttons[i][j]->setEnabled(false);
        }
    }
}

void GameBoard::enableAllButtons()
{
    updateBoard();  // This will enable only empty cells
}

void GameBoard::onResetClicked()
{
    gameLogic.initializeBoard();
    updateBoard();
    updateStatus();
    enableAllButtons();
}

void GameBoard::onMainMenuClicked()
{
    emit backToMainMenu();  // Emit signal
    this->close();
}
