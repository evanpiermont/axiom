

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
 
import os

import axiom_db_setup

from axiom_db_setup import Base, ArtList, ParaList
 
filePath = os.getcwd()
os.remove(filePath + '/axiom.db')
engine = create_engine('sqlite:///'+ filePath + '/axiom.db')
axiom_db_setup.Base.metadata.create_all(engine)


#engine = create_engine('sqlite:////Users/evanpiermont/Desktop/scrabble/restaurantmenu.db')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine
 
DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()




completeness = ArtList(
    name = 'completeness',
    name_url = "completeness")

transativity = ArtList(
    name = 'transativity',
    name_url = "transativity")

session.add(completeness)
session.add(transativity)
session.commit()

para1 = ParaList(
	art_id = completeness.id,
	para_order = 1,
	contents = "asdas...")

para2 = ParaList(
	art_id = completeness.id,
	para_order = 0,
	contents = "ddrcd,",
	next_para = 1)

para3 = ParaList(
	art_id = transativity.id,
	para_order = 0,
	contents = "trans...")


session.add(para1)
session.add(para2)
session.add(para3)
session.commit()


print "added stuff!"


