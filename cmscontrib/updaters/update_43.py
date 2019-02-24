#!/usr/bin/env python3

# Contest Management System - http://cms-dev.github.io/
# Copyright © 2018 Luca Wehrstedt <luca.wehrstedt@gmail.com>

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

"""A class to update a dump created by CMS.

Used by DumpImporter and DumpUpdater.

Update statement keys to match new format of {language:'" + language + "', statement_type:'" + statement_type + "'}

"""

from cms.db import Statement

class Updater:

    def __init__(self, data):
        assert data["_version"] == 42
        self.objs = data

    def run(self):
        for k, v in self.objs.items():
            if k.startswith("_"):
                continue

            if v["_class"] == "Task":
                
                # list of new items
                new_statements = dict()
                for k, v in v['statements'].items():
                    new_statements[Statement.create_key(v.language)] = v

                v['statements']  = new_statements

                
        return self.objs