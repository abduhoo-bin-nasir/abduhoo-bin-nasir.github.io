#include "mainwindow.h"
#include "./ui_mainwindow.h"
#include <QRegularExpression>
#include <QRegularExpressionMatch>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_Btn_1_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "1");
}


void MainWindow::on_Btn_2_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "2");
}


void MainWindow::on_Btn_3_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "3");
}


void MainWindow::on_Btn_4_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "4");
}


void MainWindow::on_Btn_5_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "5");
}


void MainWindow::on_Btn_6_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "6");
}


void MainWindow::on_Btn_7_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "7");
}


void MainWindow::on_Btn_8_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "8");
}


void MainWindow::on_Btn_9_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "9");
}


void MainWindow::on_Btn_0_clicked()
{
    ui->lineEdit->setText(ui->lineEdit->text() + "0");
}


void MainWindow::on_Btn_add_clicked()
{
    firstNumber = ui->lineEdit->text().toDouble();
    operation = "+";
    ui->lineEdit->clear();
}


void MainWindow::on_Btn_subs_clicked()
{
    firstNumber = ui->lineEdit->text().toDouble();
    operation = "-";
    ui->lineEdit->clear();
}


void MainWindow::on_Btn_mult_clicked()
{
    firstNumber = ui->lineEdit->text().toDouble();
    operation = "*";
    ui->lineEdit->clear();
}


void MainWindow::on_Btn_div_clicked()
{
    firstNumber = ui->lineEdit->text().toDouble();
    operation = "/";
    ui->lineEdit->clear();
}


void MainWindow::on_Btn_equal_clicked()
{
    double secondNumber = ui->lineEdit->text().toDouble();
    double result;

    if (operation == "+")
        result = firstNumber + secondNumber;
    else if (operation == "-")
        result = firstNumber - secondNumber;
    else if (operation == "*")
        result = firstNumber * secondNumber;
    else if (operation == "/")
        result = secondNumber != 0 ? firstNumber / secondNumber : 0;

    ui->lineEdit->setText(QString::number(result));
}



void MainWindow::on_Btn_clr_clicked()
{
    ui->lineEdit->clear();
    firstNumber = 0;
    operation = "";
}

