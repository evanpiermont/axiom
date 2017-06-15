from flask import Flask, request, redirect, url_for, render_template, jsonify, make_response
app = Flask(__name__)

import os, re, datetime, time, json
from os import curdir, sep
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

from random import randint

from axiom_db_setup import Base, ArtList, ParaList, EqList
 

### new comment

## two new coments
 
filePath = os.getcwd()
engine = create_engine('sqlite:///'+ filePath + '/axiom.db')


Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()

def urlify(s):

     # Remove all non-word characters (everything except numbers and letters)
     s = re.sub(r"[^\w\s]", '', s)

     # Replace all runs of whitespace with a single dash
     s = re.sub(r"\s+", '-', s)

     return s.lower()



####
#####
######
####### Home Page
######
#####
####

@app.route('/')
@app.route('/home')
def Home():
    return render_template('home.html')

####
#####
######
####### Page to create a new article
######
#####
####

@app.route('/create', methods=['GET'])
def Create():
    return render_template('create.html', alreadyExists=False)

####
#####
######
####### Processes New Article
######
#####
####

@app.route('/new_art', methods=['POST'])
def ProcessArticle():

    new_art_name=request.form['new_art'].lower()

    new_art_name_url = urlify(new_art_name)

    new_art_name_url = new_art_name_url

    q = session.query(ArtList).all()
    h = []
    for i in q:
        h.append(i.name)
    if new_art_name in h:
        return redirect(url_for('RenderArticle', art_name_url=new_art_name_url))
    else:
        q = ArtList(
            name = new_art_name,
            name_url = new_art_name_url)
        session.add(q)
        session.commit()

        para1 = ParaList(
        art_id = q.id,
        para_order = 0,
        contents = "...",
        isOverview = True)
        session.add(para1)
        session.commit()


        return redirect(url_for('RenderArticle', art_name_url=new_art_name_url))

####
#####
######
####### Render's Article 
######
#####
####

@app.route('/<art_name_url>', methods=['GET'])
def RenderArticle(art_name_url):

    art_name_url = art_name_url.lower()
    q = session.query(ArtList).all()
    h = []
    for i in q:
        h.append(i.name_url)
    if art_name_url in h:
        q = session.query(ArtList).filter(ArtList.name_url==art_name_url).one()
        j = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).filter(ParaList.viewable == True).order_by(ParaList.para_order)
        k = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).order_by(ParaList.para_order.desc()).first()
        
        para_list = []
        para_list.append(0)

        for i in range(j.count() - 1):
            nxt = j.filter(ParaList.para_order == para_list[i]).one().next_para
            next_para_order = j.filter(ParaList.para_order == nxt).one().para_order
            para_list.append(next_para_order)

        j = sorted(j, key=lambda o: para_list.index(o.para_order))

        return render_template('article.html', art=q, para_list = j, name_url=art_name_url)
    else:
        return render_template('home.html')


####
#####
######
####### Create New Para, JSON 
######
#####
####


@app.route('/_update/<art_name_url>/<para_order>', methods=['POST'])
def CommitParaJSON(art_name_url, para_order):

    q = session.query(ArtList).filter(ArtList.name_url==art_name_url).one()
    j = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).filter(ParaList.viewable == True).filter(ParaList.para_order == para_order).one()

    para_identity = str(q.id) + "x" + str(j.para_order)

    if request.form['submit'] == 'commit':

        c_iteration = j.iteration
        contents=request.form[para_identity + "text"]

        isSection=request.form['issec']
        isSection = json.loads(isSection)

        texcode =request.form['texcode']
        texcode = json.loads(texcode)


        j.viewable = False
        j.isSection = isSection
        session.add(j)
        session.commit()

        new_para = ParaList(
        art_id = q.id,
        para_order = para_order,
        iteration = c_iteration + 1,
        next_para = j.next_para,
        isSection = j.isSection,
        isOverview = j.isOverview,
        contents = contents,
        texcode = texcode)

        session.add(new_para)
        session.commit()

        eq = request.form['eq'] #list of equations as a string

        j = json.loads(eq) #list of eq as a dict

        for key in j:

            m = session.query(EqList).join(ArtList).filter(ArtList.id == q.id).filter(EqList.label == key)

            if m.count():
                eqx = m.one()
                eqx.eqtext = j[key][0]
                eqx.eq_number = j[key][1]
                session.add(eqx)
                session.commit()

            else:
                neweq = EqList(
                    art_id =  q.id,
                    label = key,
                    eqtext = j[key][0],
                    eq_number = j[key][1])
                session.add(neweq)
                session.commit()


        k = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).filter(ParaList.viewable == True).order_by(ParaList.para_order)
        
        para_list = []
        para_list.append(0)

        for i in range(k.count() - 1):
            nxt = k.filter(ParaList.para_order == para_list[i]).one().next_para
            next_para_order = k.filter(ParaList.para_order == nxt).one().para_order
            para_list.append(next_para_order)

        k = sorted(k, key=lambda o: para_list.index(o.para_order))

        overviewWhile = True

        for para in k:
            if para.isSection:
                para.isOverview = False
                overviewWhile = False
            else:
                para.isOverview = overviewWhile
                session.add(para)
                session.commit()


        return jsonify(para_contents=new_para.contents, para=para_identity + 'para', isOverview=new_para.isOverview, isSection=new_para.isSection)

    elif request.form['submit'] == 'discard':

        return jsonify(para_contents=j.contents, para=para_identity + 'para')

    elif request.form['submit'] == 'add_below':

        k = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).order_by(ParaList.para_order.desc()).first()
    
        max_order = k.para_order + 1

        nxt = j.next_para

        new_para = ParaList(
        art_id = q.id,
        para_order = max_order,
        next_para = nxt,
        contents="")

        j.next_para = max_order  

        session.add(new_para)
        session.add(j)
        session.commit() 

        return jsonify(prev_para=para_identity, para_order=max_order, new_para=str(q.id) + "x" + str(max_order)) 

    elif request.form['submit'] == 'delete':

        prev = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).filter(ParaList.viewable == True).filter(ParaList.next_para == para_order).one()

        prev.next_para = j.next_para

        j.viewable = False
        session.add(j)
        session.add(prev)
        session.commit()

        return jsonify(para_contents=j.contents, para=para_identity + 'para')

####
#####
######
####### Update References 
######
#####
####

@app.route('/_update/<art_name_url>/Ref', methods=['POST'])
def CommitREFS(art_name_url):

    q = session.query(ArtList).filter(ArtList.name_url==art_name_url).one()

    para_identity = str(q.id) + "xR"

    if request.form['submit'] == 'commit':

        cites= request.form[para_identity + "text"]

        q.cites = cites
        session.add(q)
        session.commit()

        return jsonify(para_contents=q.cites, para=para_identity + 'para')

    if request.form['submit'] == 'discard':

        cites=request.form[para_identity + "text"]

        return jsonify(para_contents=q.cites, para=para_identity + 'para')


@app.route('/_update/<art_name_url>/new', methods=['POST'])
def NewParaJSON(art_name_url):

    q = session.query(ArtList).filter(ArtList.name_url==art_name_url).one()
    k = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).order_by(ParaList.para_order.desc()).first()
    
    if k:
        max_order = k.para_order + 1
    else:
        max_order = 1

    para_identity = str(q.id) + "x" + str(max_order)

    new_para = ParaList(
    art_id = q.id,
    para_order = max_order,
    contents="")  

    session.add(new_para)
    session.commit()  

    return jsonify(para=para_identity, para_order=max_order)



@app.route('/_getEQ')
def getEQJSON():

    eq = request.args.get('eqlabel', 0)
    foreign_art_id = request.args.get('foreign_art_id', 0)

    eq_qry = session.query(EqList).join(ArtList).filter(ArtList.name_url == foreign_art_id).filter(EqList.label == eq)

    if eq_qry.count():
        eqx = eq_qry.one()
        return jsonify(eq_text=eqx.eqtext, eq_number=eqx.eq_number)

    else:
        return jsonify(eq_text=False)

@app.route('/_getOV')
def getOVJSON():

    foreign_art_id = request.args.get('foreign_art_id', 0)

    k = session.query(ParaList).join(ArtList).filter(ArtList.name == foreign_art_id).filter(ParaList.isOverview == True).filter(ParaList.viewable == True).order_by(ParaList.para_order)
     
    if k.count():   

        para_list = []
        para_list.append(0)
    
        for i in range(k.count() - 1):
            nxt = k.filter(ParaList.para_order == para_list[i]).one().next_para
            next_para_order = k.filter(ParaList.para_order == nxt).one().para_order
            para_list.append(next_para_order)
        k = sorted(k, key=lambda o: para_list.index(o.para_order))
    
        ov_text = []
    
        for para in k:
            ov_text.append(para.contents)
    
        return jsonify(ov_text=ov_text)

    else:
        return jsonify(ov_text=False)

@app.route('/_getDL/<art_id>',  methods=['GET', 'POST'])
def getDL(art_id):

    q = session.query(ArtList).filter(ArtList.name_url==art_id).one()

    k = session.query(ParaList).join(ArtList).filter(ArtList.name == art_id).filter(ParaList.viewable == True).order_by(ParaList.para_order)
     
    if k.count():   

        para_list = []
        para_list.append(0)
    
        for i in range(k.count() - 1):
            nxt = k.filter(ParaList.para_order == para_list[i]).one().next_para
            next_para_order = k.filter(ParaList.para_order == nxt).one().para_order
            para_list.append(next_para_order)
        k = sorted(k, key=lambda o: para_list.index(o.para_order))

    #render_template('axiom.tex')

    tex = """\documentclass[paper=a4, fontsize=11pt]{article} %% A4 paper and 11pt font size
\usepackage[english]{babel} % English language/hyphenation
\usepackage{amsmath,amsfonts,amsthm, dsfont} %% Math packages
\usepackage{filecontents}
\usepackage{hyperref} %% hyperlinks
\usepackage{xcolor} %% colors

%%%%
%%%% COLORS
%%%%


\definecolor{linkcolor}{HTML}{ 2D6793}


\hypersetup{
colorlinks=true,
linkcolor=linkcolor,
urlcolor=linkcolor,
citecolor=linkcolor        % color of links to bibliography
}

%%%%
%%%% SPACING / NUMBERING / TITLES
%%%%


\usepackage{titlesec}
\\titleformat*{\section}{\large\scshape\centering}
\\titleformat*{\subsection}{\scshape\centering}
\\titleformat*{\subsubsection}{\itshape}
\\titleformat*{\paragraph}{\large\\bfseries\centering}
\\titleformat*{\subparagraph}{\large\\bfseries\centering}

\\titlespacing*\section{0pt}{8pt plus 4pt minus 2pt}{6pt plus 0pt minus 2pt}

%%%%
%%%% ENVIORNMENTS
%%%%

\\newtheorem{thm}{Theorem}
\\newtheorem{prop}[thm]{Proposition}
\\newtheorem{cor}{Corollary}[thm]
\\newtheorem{lemma}{Lemma}
\\newtheorem{ass}{Assumption}
\\newtheorem{rmk}{Remark}
\\newtheorem*{definition}{Definition}
\\newtheorem*{example}{Example}

%%%%
%%%% LOCAL BIB
%%%%

\\begin{filecontents}{localbib.bib} \n"""
            
    tex += q.cites

    tex += """\n \\end{filecontents}

\\usepackage{natbib}


%%%%
%%%% DOCUMENT
%%%%

\\begin{document}
    
        """

    tex += '''\n \n \n \\title{{ {0}\\thanks{{This document was created via Axiom. 201pWebDev.}} \\date{{{1}}} }}\\maketitle \n \n \section{{Overview}}\label{{sec:overview}} \n \n'''.format(art_id.title(), datetime.datetime.now())

    for para in k:
        cur_para = para.texcode
        tex += cur_para
        tex += '\n \n \n \n'


    tex += """\\nocite{*}\n\\bibliographystyle{plain}\n\\bibliography{localbib}\n\\end{document}"""
    response = make_response(tex)
    response.headers["Content-Disposition"] = "attachment; filename="+art_id+".tex"
    return response



    #return jsonify(text=art_id)


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)





