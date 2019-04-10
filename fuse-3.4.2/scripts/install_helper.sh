#!/bin/sh
#
# Don't call this script. It is used internally by the Meson
# build system. Thank you for your cooperation.
#

set -e

sysconfdir=/etc
udevrulesdir=/udev/rules.d

DESTDIR=""

install -D -m 644 "${FUSE_ROOT}/fuse.conf" \
	"${DESTDIR}${sysconfdir}/fuse.conf"


if test ! -e "${DESTDIR}/dev/fuse"; then
    mkdir -p "${DESTDIR}/dev"
    mknod "${DESTDIR}/dev/fuse" -m 0666 c 10 229
fi

install -D -m 644 "${FUSE_ROOT}/udev.rules" \
        "${DESTDIR}${udevrulesdir}/99-fuse3.rules"
