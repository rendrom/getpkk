import json

from django.contrib.gis.gdal import CoordTransform, SpatialReference
from django.contrib.gis.geos import GEOSGeometry, Point
from django.core.files import File
from django.http import JsonResponse
from django.views.generic.base import TemplateView

from models import Geom, Pkk, Usage
from prj.settings import MEDIA_ROOT
from rosreestr.rosreestr2coord import Area

import os


class GetAreaView (TemplateView):
    template_name = 'pkk/index.html'

    def get_context_data(self, **kwargs):
        context = super(GetAreaView, self).get_context_data(**kwargs)
        code = kwargs.get('code')
        if code:
            print(code)
            area = _get_area(code)
            context["AREA"] = json.dumps(area)
        return context


def _transform_xy_array(array, from_crs=3857, to_crs=4326):
    coordinates = []
    from_coord = SpatialReference(from_crs)
    to_coord = SpatialReference(to_crs)
    trans = CoordTransform(from_coord, to_coord)
    for x, y in array:
        pnt = Point(x, y, srid=3857)
        pnt.transform(trans)
        coordinates.append(map(lambda i: "%f" % i, [pnt.x, pnt.y]))
    return coordinates


def _get_area(code):
    split = code.split('e')
    code = split[0]
    code = code.replace('-', ':')
    epsilon = float(split[1] if len(split) > 1 else 5)
    data = {"code": code}
    media_path = MEDIA_ROOT
    exist = False
    if code:
        pkk = (Pkk.objects.filter(code=code) or [None])[0]
        if pkk:
            area = Area(media_path)
            area.image_path = pkk.image.path
            area.image_extent = pkk.image_extent
            area.center = pkk.center
            area.width = pkk.width
            area.height = pkk.height
            area.get_geometry("png")
        else:
            pkk = Pkk(code=code)
            area = Area(code, epsilon, media_path)

        xy = area.get_coord()
        if len(xy) and len(xy[0]):
            coordinates = _transform_xy_array(xy[0][0])
            data["coordinates"] = coordinates
            if area.center:
                data["center_pkk"] = area.center
            if len(xy[0]) > 0:
                data["holes"] = [_transform_xy_array(xy_hole) for xy_hole in xy[0][1:]]
            attrs = area.get_attrs()
            if attrs:
                pkk.attrs = attrs
                data["attrs"] = attrs

            if not exist:
                pkk.image = File(open(area.image_path))
                pkk.center = area.center
                pkk.extent = area.extent
                pkk.image_extent = area.image_extent
                pkk.width = area.width
                pkk.height = area.height
                pkk.save()
                os.remove(area.image_path)

            geojson_poly = area._to_geojson(type="polygon")
            if geojson_poly:
                try:
                    poly = GEOSGeometry(json.dumps(geojson_poly['features'][0]['geometry']), srid=3857)
                    poly.transform(4326)
                    data["kml"] = poly.kml

                    geom = (Geom.objects.filter(code=pkk, epsilon=epsilon) or [None])[0]
                    if not geom:
                        geom = Geom(code=pkk, geom=poly, epsilon=epsilon)
                        geom.save()
                    usage = Usage(geom=geom)
                    usage.save()

                except Exception as er:
                    print(er)
                data["geojson"] = json.dumps(geojson_poly)
    return data


def get_area(req, code):
    return JsonResponse(_get_area(code))