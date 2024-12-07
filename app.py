from flask import Flask, jsonify, render_template
import pandas as pd
import plotly.express as px

app = Flask(__name__)

# Load datasets
athletes_df = pd.read_csv('data_paris_olympics/athletes.csv')
medals_df = pd.read_csv('data_paris_olympics/medals.csv')
schedules_df = pd.read_csv('data_paris_olympics/schedules.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/athletes-story')
def athletes_story():
    return render_template('story_athletes.html')

@app.route('/medals-story')
def medals_story():
    return render_template('story_medals.html')

@app.route('/event-timeline-story')
def event_timeline_story():
    return render_template('story_event_timeline.html')

@app.route('/athletes_data_age')
def athletes_data_age():
    fig = px.histogram(athletes_df, x='age', nbins=20, title="Age Distribution of Athletes", labels={'age': 'Age'})
    return jsonify(fig.to_json())

@app.route('/athletes_data_gender')
def athletes_data_gender():
    fig = px.pie(athletes_df, names='gender', title="Gender Distribution of Athletes", labels={'gender': 'Gender'})
    return jsonify(fig.to_json())

@app.route('/medals_distribution')
def medals_distribution():
    fig = px.bar(
        medals_df,
        x='country',
        y='total_medals',
        color='gold',
        title="Medals Distribution by Country",
        labels={'country': 'Country', 'total_medals': 'Total Medals'}
    )
    return jsonify(fig.to_json())

@app.route('/schedule_events')
def schedule_events():
    schedules_df['start_date'] = pd.to_datetime(schedules_df['start_date'])
    event_counts = schedules_df.groupby('start_date').size().reset_index(name='events')
    fig = px.line(event_counts, x='start_date', y='events', title="Event Trends Over Time", labels={'start_date': 'Date', 'events': 'Number of Events'})
    return jsonify(fig.to_json())

if __name__ == '__main__':
    app.run(debug=True)
