

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
 
import axiom_db_setup

from axiom_db_setup import ArtList, ParaList, BibList, db, app
 
db.drop_all()
db.create_all()

session = db.session

bib = ArtList(
    name = 'References',
    name_url = "bib")

completeness = ArtList(
    name = 'completeness',
    name_url = "completeness")


session.add(bib)
session.add(completeness)
session.commit()

bib1 = BibList(
    citekey = "",
    alph = "a",
    author = 'Evan Piermont',
    title = 'Poop',
    journal = 'GEB',
    year = '2006',
    pages = '10-30, ',
    volume = '20:')
session.add(bib1)
session.commit()



print("added stuff!")


