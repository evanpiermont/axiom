

# from flask_sqlalchemy import SQLAlchemy

import os
import sys
import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, Table, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import create_engine

Base = declarative_base()


class ArtList(Base):
    __tablename__ = 'article'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    name_url = Column(String(100), nullable=False)
    cites = Column(String(100), default='')
    art_create_time = Column(DateTime, default=datetime.datetime.utcnow)


class ParaList(Base):
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
    contents = Column(String(100), nullable=False)
    texcode = Column(String(100), default='')


class EqList(Base):
    __tablename__ = 'equations'

    id = Column(Integer, primary_key=True)
    art_id = Column(Integer, ForeignKey("article.id"))
    artlist = relationship(ArtList)
    eq_create_time = Column(DateTime, default=datetime.datetime.utcnow)
    label = Column(String(100), nullable=False)
    eqtext = Column(String(100), nullable=False)
    eq_number = Column(Integer)


filePath = os.getcwd()
engine = create_engine('sqlite:///'+ filePath + '/axiom.db')


Base.metadata.create_all(engine)

