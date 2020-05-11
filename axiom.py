from flask import Flask, request, redirect, url_for, render_template, jsonify, make_response
app = Flask(__name__)

import os, re, datetime, time, json
from os import curdir, sep
from http.server import BaseHTTPRequestHandler, HTTPServer

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

from random import randint

from axiom_db_setup import ArtList, ParaList, EqList, BibList, db, app
 
session = db.session


def urlify(s):

     # Remove all non-word characters (everything except numbers and letters)
     s = re.sub(r"[^\w\s]", '', s)

     # Replace all runs of whitespace with a single dash
     s = re.sub(r"\s+", '-', s)

     return s.lower()



###
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
        #k = session.query(ParaList).join(ArtList).filter(ArtList.id == q.id).order_by(ParaList.para_order.desc()).first()
        
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
####### Render's Reference
######
#####
####

@app.route('/bib', methods=['GET', 'POST'])
def RenderBib():

    q = session.query(ArtList).filter(ArtList.name_url=='bib').one()
    j = session.query(BibList).order_by(BibList.alph).all()
    
    print(j)

    return render_template('bib.html', 
        art=q, 
        para_list = j, 
        name_url='bibliography'
        )



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
####### Update References FIXXXXX
######
#####
####

@app.route('/_update_bib', methods=['POST'])
def CommitREFS():

    if request.form['submit'] == 'commit':

        citekey = request.form['citekey']
        old_citekey = request.form['old_citekey']

        texcode = request.form['texcode']
        author = request.form['author']
        title = request.form['title']
        journal = request.form['journal']
        year = request.form['year']
        pages = request.form['pages']
        volume = request.form['volume']
        number = request.form['number']

        if number:
            number = "(" + number + ")"
        if volume:
            volume = ", " + volume
        else:
            number = ", no." + number
        if pages:
            pages = ", pp. " + pages

        if(not journal):
            journal = "Mimeo"

        author_list=author.split(" and ")
        for i in range(len(author_list)):
            author_list[i] = author_list[i].split(",")[0]

        if len(author_list) > 2:
            cite_text = author_list[0].split(",")[0] + "et. al. (" + year + ")"
        else:
            cite_text = ""
            for auth in author_list:
                cite_text += auth.split(",")[0] + " and "
            cite_text = cite_text[:-5]
   


        print(author_list)

        if old_citekey:

            q2 =  session.query(BibList).filter(BibList.citekey == old_citekey).first()


            if q2: #if oldcite has been taken

                q2.citekey = citekey
                q2.texcode = texcode
                q2.alph = author + year
                q2.author = author
                q2.title = title
                q2.journal = journal
                q2.year = year
                q2.pages = pages
                q2.volume = volume
                q2.number = number
                q2.cite_text = cite_text

                session.add(q2)
                session.commit()

                return jsonify(json=True, citekey=citekey)


        q =  session.query(BibList).filter(BibList.citekey == citekey).first()


        if q: #if there is an prior cite key

            q.citekey = citekey
            q.texcode = texcode
            q.alph = author + year
            q.author = author
            q.title = title
            q.journal = journal
            q.year = year
            q.pages = pages
            q.volume = volume
            q.number = number
            q.cite_text = cite_text

            session.add(q)
            session.commit()

            return jsonify(json=True, citekey=citekey)




        else:

            print(texcode, len(texcode))
    
            new_cite =BibList(
                citekey = citekey,
                texcode = texcode,
                alph = author + year,
                author = author,
                title = title,
                journal = journal,
                year = year,
                pages = pages,
                volume = volume,
                number = number,
                cite_text = cite_text,
                )
            session.add(new_cite)
            session.commit()
    
            return jsonify(json=True, citekey=citekey)

    if request.form['submit'] == 'discard':

        return jsonify(json=True)

    if request.form['submit'] == 'delete':

        citekey = request.form['citekey']
        q =  session.query(BibList).filter(BibList.citekey == citekey).delete()
        session.commit()


        return jsonify(json=True)



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

@app.route('/_getREFS')
def getREFSJSON():

    keylist = json.loads(request.args.get('keylist'))

    keydict = {}
    
    for citekey in keylist:
        c =  session.query(BibList).filter(BibList.citekey == citekey).first()
        print(citekey, c)
        if c:
            keydict[citekey] = {}
            keydict[citekey]['texcode'] = c.texcode
            keydict[citekey]['alph'] = c.alph
            keydict[citekey]['author'] = c.author
            keydict[citekey]['title'] = c.title
            keydict[citekey]['journal'] = c.journal
            keydict[citekey]['year'] = c.year
            keydict[citekey]['pages'] = c.pages
            keydict[citekey]['volume'] = c.volume
            keydict[citekey]['number'] = c.number
            keydict[citekey]['cite_text'] = c.cite_text
        else:   
            keydict[citekey] = False
    
    json_key_list = json.dumps(keydict)


    
    return jsonify(json_key_list=json_key_list)

@app.route('/_getCITETEXT')
def getCITETEXT():

    current_key = request.args.get('current_key')

    
    c =  session.query(BibList).filter(BibList.citekey == current_key).first()

    if c:
        
        return jsonify(cite_text = c.cite_text, year=c.year)
    else:
        return jsonify(False)



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

    tex = """\\documentclass[paper=a4, fontsize=11pt]{article} %% A4 paper and 11pt font size
\\usepackage[english]{babel} % English language/hyphenation
\\usepackage{amsmath,amsfonts,amsthm, dsfont} %% Math packages
\\usepackage{filecontents}
\\usepackage{hyperref} %% hyperlinks
\\usepackage{xcolor} %% colors

%%%%
%%%% COLORS
%%%%


\\definecolor{linkcolor}{HTML}{ 2D6793}


\\hypersetup{
colorlinks=true,
linkcolor=linkcolor,
urlcolor=linkcolor,
citecolor=linkcolor        % color of links to bibliography
}

%%%%
%%%% SPACING / NUMBERING / TITLES
%%%%


\\usepackage{titlesec}
\\titleformat*{\\section}{\\large\\scshape\\centering}
\\titleformat*{\\subsection}{\\scshape\\centering}
\\titleformat*{\\subsubsection}{\\itshape}
\\titleformat*{\\paragraph}{\\large\\bfseries\\centering}
\\titleformat*{\\subparagraph}{\\large\\bfseries\\centering}

\\titlespacing*\\section{0pt}{8pt plus 4pt minus 2pt}{6pt plus 0pt minus 2pt}

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

    tex += '''\n \n \n \\title{{ {0}\\thanks{{This document was created via Axiom:: {{{1}}}.}}  }}\\maketitle \n \n \\section{{Overview}}\\label{{sec:overview}} \n \n'''.format(art_id.title(), datetime.datetime.now())

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





