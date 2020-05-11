


from flask import Flask, request, redirect, url_for, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy

from flask_heroku import Heroku

app = Flask(__name__)

import os
import sys
import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, Table, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import create_engine

#app.config['SQLALCHEMY_DATABASE_URI'] = ''
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/axiom'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#heroku = Heroku(app)
db = SQLAlchemy(app)


class ArtList(db.Model):
    __tablename__ = 'article'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    name_url = Column(String(100), nullable=False)
    cites = Column(String(100), default='')
    art_create_time = Column(DateTime, default=datetime.datetime.utcnow)


class ParaList(db.Model):
    __tablename__ = 'paragraph'

    id = Column(Integer, primary_key=True)
    art_id = Column(Integer, ForeignKey("article.id"))
    artlist = relationship(ArtList)
    para_order = Column(Integer, nullable=False)
    next_para = Column(Integer)
    viewable = Column(Boolean, unique=False, default=True)
    isSection = Column(Boolean, unique=False, default=False)
    isOverview = Column(Boolean, unique=False, default=False)
    iteration = Column(Integer, nullable=False, default=1)
    para_create_time = Column(DateTime, default=datetime.datetime.utcnow)
    contents = Column(String(64000), nullable=False)
    texcode = Column(String(64000), default='')


class EqList(db.Model):
    __tablename__ = 'equations'

    id = Column(Integer, primary_key=True)
    art_id = Column(Integer, ForeignKey("article.id"))
    artlist = relationship(ArtList)
    eq_create_time = Column(DateTime, default=datetime.datetime.utcnow)
    label = Column(String(50000), nullable=False)
    eqtext = Column(String(5000), nullable=False)
    eq_number = Column(Integer)

class BibList(db.Model):
    __tablename__ = 'bib'

    id = Column(Integer, primary_key=True)
    citekey = Column(String(1000), nullable=False)
    create_time = Column(DateTime, default=datetime.datetime.utcnow)
    alph = Column(String(1000), default='zzz') #for alphabatizing
    texcode = Column(String(64000), default='')
    author = Column(String(1000), default='')
    title = Column(String(1000), default='')
    journal = Column(String(1000), default='')
    year = Column(String(100), default='')
    pages = Column(String(100), default='')
    volume = Column(String(100), default='')
    number = Column(String(100), default='')
    cite_text = Column(String(1000), default='')




