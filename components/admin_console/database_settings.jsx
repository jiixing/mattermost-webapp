// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {recycleDatabaseConnection} from 'actions/admin_actions.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import GeneratedSetting from './generated_setting.jsx';
import RequestButton from './request_button/request_button.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class DatabaseSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        // driverName and dataSource are read-only from the UI

        config.SqlSettings.MaxIdleConns = this.parseIntNonZero(this.state.maxIdleConns);
        config.SqlSettings.MaxOpenConns = this.parseIntNonZero(this.state.maxOpenConns);
        config.SqlSettings.Trace = this.state.trace;
        config.SqlSettings.QueryTimeout = this.parseIntNonZero(this.state.queryTimeout);

        return config;
    }

    getStateFromConfig(config) {
        return {
            driverName: config.SqlSettings.DriverName,
            maxIdleConns: config.SqlSettings.MaxIdleConns,
            maxOpenConns: config.SqlSettings.MaxOpenConns,
            trace: config.SqlSettings.Trace,
            queryTimeout: config.SqlSettings.QueryTimeout,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.database.title'
                defaultMessage='Database Settings'
            />
        );
    }

    renderSettings() {
        const dataSource = '**********' + this.state.dataSource.substring(this.state.dataSource.indexOf('@'));

        let recycleDbButton = <div/>;
        if (this.props.license.IsLicensed === 'true') {
            recycleDbButton = (
                <RequestButton
                    requestAction={recycleDatabaseConnection}
                    helpText={
                        <FormattedMessage
                            id='admin.recycle.recycleDescription'
                            defaultMessage='Deployments using multiple databases can switch from one master database to another without restarting the Mattermost server by updating "config.json" to the new desired configuration and using the {reloadConfiguration} feature to load the new settings while the server is running. The administrator should then use {featureName} feature to recycle the database connections based on the new settings.'
                            values={{
                                featureName: (
                                    <b>
                                        <FormattedMessage
                                            id='admin.recycle.recycleDescription.featureName'
                                            defaultMessage='Recycle Database Connections'
                                        />
                                    </b>
                                ),
                                reloadConfiguration: (
                                    <a href='../general/configuration'>
                                        <b>
                                            <FormattedMessage
                                                id='admin.recycle.recycleDescription.reloadConfiguration'
                                                defaultMessage='Configuration > Reload Configuration from Disk'
                                            />
                                        </b>
                                    </a>
                                ),
                            }}
                        />
                    }
                    buttonText={
                        <FormattedMessage
                            id='admin.recycle.button'
                            defaultMessage='Recycle Database Connections'
                        />
                    }
                    showSuccessMessage={false}
                    errorMessage={{
                        id: 'admin.recycle.reloadFail',
                        defaultMessage: 'Recycling unsuccessful: {error}',
                    }}
                    includeDetailedError={true}
                />
            );
        }

        return (
            <SettingsGroup>
                <div className='banner'>
                    <FormattedMessage
                        id='admin.sql.noteDescription'
                        defaultMessage='Changing properties in this section will require a server restart before taking effect.'
                    />
                </div>
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                        htmlFor='DriverName'
                    >
                        <FormattedMessage
                            id='admin.sql.driverName'
                            defaultMessage='Driver Name:'
                        />
                    </label>
                    helpText={
                        <FormattedMessage
                            id='admin.sql.driverNameDescription'
                            defaultMessage='Set the database driver in the config.json file.'
                        />
                    }
                    <div className='col-sm-8'>
                        <p className='help-text'>{this.state.driverName}</p>
                    </div>
                </div>
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                        htmlFor='DataSource'
                    >
                        <FormattedMessage
                            id='admin.sql.dataSource'
                            defaultMessage='Data Source:'
                        />
                    </label>
                    <div className='col-sm-8'>
                        <p className='help-text'>{dataSource}</p>
                    </div>
                </div>
                <TextSetting
                    id='maxIdleConns'
                    label={
                        <FormattedMessage
                            id='admin.sql.maxConnectionsTitle'
                            defaultMessage='Maximum Idle Connections:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.maxConnectionsExample', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.maxConnectionsDescription'
                            defaultMessage='Maximum number of idle connections held open to the database.'
                        />
                    }
                    value={this.state.maxIdleConns}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.MaxIdleConns')}
                />
                <TextSetting
                    id='maxOpenConns'
                    label={
                        <FormattedMessage
                            id='admin.sql.maxOpenTitle'
                            defaultMessage='Maximum Open Connections:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.maxOpenExample', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.maxOpenDescription'
                            defaultMessage='Maximum number of open connections held open to the database.'
                        />
                    }
                    value={this.state.maxOpenConns}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.MaxOpenConns')}
                />
                <TextSetting
                    id='queryTimeout'
                    label={
                        <FormattedMessage
                            id='admin.sql.queryTimeoutTitle'
                            defaultMessage='Query Timeout:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.queryTimeoutExample', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.queryTimeoutDescription'
                            defaultMessage='The number of seconds to wait for a response from the database after opening a connection and sending the query. Errors that you see in the UI or in the logs as a result of a query timeout can vary depending on the type of query.'
                        />
                    }
                    value={this.state.queryTimeout}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.QueryTimeout')}
                />
                <BooleanSetting
                    id='trace'
                    label={
                        <FormattedMessage
                            id='admin.sql.traceTitle'
                            defaultMessage='SQL Statement Logging: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.sql.traceDescription'
                            defaultMessage='(Development Mode) When true, executing SQL statements are written to the log.'
                        />
                    }
                    value={this.state.trace}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.Trace')}
                />
                {recycleDbButton}
            </SettingsGroup>
        );
    }
}
